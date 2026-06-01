import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type OrcamentoFiltros = {
  atendimentoId?: string;
  vencidosAte?: Date;
  somenteAtivos?: boolean;
  pagina?: number;
  tamanho?: number;
};

function montarWhere(filtros: Omit<OrcamentoFiltros, "pagina" | "tamanho">) {
  const { atendimentoId, vencidosAte, somenteAtivos } = filtros;

  return {
    ...(atendimentoId && { atendimentoId }),
    ...(vencidosAte && { validoAte: { lte: vencidosAte } }),
    ...(somenteAtivos && { validoAte: { gte: new Date() } }),
  } satisfies Prisma.OrcamentoWhereInput;
}

export const orcamentoRepository = {
  listar(filtros: OrcamentoFiltros = {}) {
    const { pagina = 1, tamanho = 20 } = filtros;

    return prisma.orcamento.findMany({
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
      },
      orderBy: { createdAt: "desc" },
      skip: (pagina - 1) * tamanho,
      take: tamanho,
    });
  },

  contar(filtros: Omit<OrcamentoFiltros, "pagina" | "tamanho"> = {}) {
    return prisma.orcamento.count({ where: montarWhere(filtros) });
  },

  buscarPorId(id: string) {
    return prisma.orcamento.findUnique({
      where: { id },
      include: {
        atendimento: {
          include: { cliente: true },
        },
      },
    });
  },

  buscarPorAtendimentoId(atendimentoId: string) {
    return prisma.orcamento.findUnique({ where: { atendimentoId } });
  },

  listarVencidosPendentes(referencia = new Date()) {
    return prisma.orcamento.findMany({
      where: {
        validoAte: { lt: referencia },
        atendimento: {
          status: "ORCAMENTO_REGISTRADO_AG_APROVACAO",
        },
      },
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
      },
      orderBy: { validoAte: "asc" },
    });
  },

  criar(
    dados: Prisma.OrcamentoCreateInput | Prisma.OrcamentoUncheckedCreateInput,
  ) {
    return prisma.orcamento.create({ data: dados });
  },

  atualizar(
    id: string,
    dados: Prisma.OrcamentoUpdateInput | Prisma.OrcamentoUncheckedUpdateInput,
  ) {
    return prisma.orcamento.update({ where: { id }, data: dados });
  },
};
