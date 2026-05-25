import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type ContratoFiltros = {
  clienteId?: string;
  periodoInicio?: Date;
  periodoFim?: Date;
  apenasAtivos?: boolean;
  pagina?: number;
  tamanho?: number;
};

function montarWhere(filtros: Omit<ContratoFiltros, "pagina" | "tamanho">) {
  const { clienteId, periodoInicio, periodoFim, apenasAtivos = true } = filtros;

  return {
    ...(apenasAtivos && { ativo: true }),
    ...(clienteId && {
      atendimento: {
        clienteId,
      },
    }),
    ...((periodoInicio || periodoFim) && {
      geradoEm: {
        ...(periodoInicio && { gte: periodoInicio }),
        ...(periodoFim && { lte: periodoFim }),
      },
    }),
  } satisfies Prisma.ContratoWhereInput;
}

export const contratoRepository = {
  listar(filtros: ContratoFiltros = {}) {
    const { pagina = 1, tamanho = 20 } = filtros;

    return prisma.contrato.findMany({
      where: montarWhere(filtros),
      include: {
        atendimento: {
          include: {
            cliente: {
              select: {
                id: true,
                nome: true,
                cpfCnpj: true,
              },
            },
          },
        },
        geradoPorUsuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
      orderBy: { geradoEm: "desc" },
      skip: (pagina - 1) * tamanho,
      take: tamanho,
    });
  },

  contar(filtros: Omit<ContratoFiltros, "pagina" | "tamanho"> = {}) {
    return prisma.contrato.count({ where: montarWhere(filtros) });
  },

  buscarPorId(id: string) {
    return prisma.contrato.findUnique({
      where: { id },
      include: {
        atendimento: {
          include: {
            cliente: true,
          },
        },
      },
    });
  },

  buscarPorAtendimento(atendimentoId: string) {
    return prisma.contrato.findFirst({
      where: { atendimentoId, ativo: true },
      orderBy: { geradoEm: "desc" },
    });
  },

  listarPorAtendimento(atendimentoId: string) {
    return prisma.contrato.findMany({
      where: { atendimentoId, ativo: true },
      include: {
        geradoPorUsuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
      orderBy: { geradoEm: "desc" },
    });
  },

  criar(
    dados: Prisma.ContratoCreateInput | Prisma.ContratoUncheckedCreateInput,
  ) {
    return prisma.contrato.create({ data: dados });
  },

  atualizar(
    id: string,
    dados: Prisma.ContratoUpdateInput | Prisma.ContratoUncheckedUpdateInput,
  ) {
    return prisma.contrato.update({ where: { id }, data: dados });
  },

  desativar(id: string) {
    return prisma.contrato.update({ where: { id }, data: { ativo: false } });
  },
};
