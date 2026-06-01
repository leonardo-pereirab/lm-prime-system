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

export type ContratoListagemItem = {
  id: string;
  atendimentoId: string;
  pdfUrl: string | null;
  geradoEm: Date;
  ativo: boolean;
  atendimento: {
    id: string;
    codigo: string | null;
    dataServico: Date | null;
    cliente: {
      id: string;
      nome: string;
      cpfCnpj: string;
    } | null;
  };
  geradoPorUsuario: {
    id: string;
    nome: string;
    email: string;
  } | null;
};

export type ContratoListagemPaginada = {
  itens: ContratoListagemItem[];
  total: number;
  pagina: number;
  tamanho: number;
  totalPaginas: number;
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

  async listarPaginado(
    filtros: ContratoFiltros = {},
  ): Promise<ContratoListagemPaginada> {
    const { pagina = 1, tamanho = 10 } = filtros;
    const where = montarWhere(filtros);

    const selectAtendimento = {
      id: true,
      codigo: true,
      dataServico: true,
      cliente: {
        select: {
          id: true,
          nome: true,
          cpfCnpj: true,
        },
      },
    } as const;

    const selectGeradoPor = {
      id: true,
      nome: true,
      email: true,
    } as const;

    const [itens, total] = await prisma.$transaction([
      prisma.contrato.findMany({
        where,
        select: {
          id: true,
          atendimentoId: true,
          pdfUrl: true,
          geradoEm: true,
          ativo: true,
          atendimento: { select: selectAtendimento },
          geradoPorUsuario: { select: selectGeradoPor },
        },
        orderBy: { geradoEm: "desc" },
        skip: (pagina - 1) * tamanho,
        take: tamanho,
      }),
      prisma.contrato.count({ where }),
    ]);

    return {
      itens,
      total,
      pagina,
      tamanho,
      totalPaginas: Math.max(1, Math.ceil(total / tamanho)),
    };
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
