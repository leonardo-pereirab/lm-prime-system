import { ConflictError } from "@/domain/errors";
import { gerarCodigoAtendimento } from "@/domain/helpers";
import { prisma } from "@/lib/prisma";
import { addDays } from "date-fns";
import { Prisma } from "@prisma/client";
import type { StatusAtendimento } from "@prisma/client";

export type AtendimentoFiltros = {
  busca?: string;
  status?: StatusAtendimento;
  clienteId?: string;
  dataServicoDe?: Date;
  dataServicoAte?: Date;
  pagina?: number;
  tamanho?: number;
};

export type AtendimentoListagemItem = {
  id: string;
  codigo: string | null;
  status: StatusAtendimento;
  dataContato: Date;
  dataServico: Date | null;
  tipoServico: Prisma.AtendimentoGetPayload<{
    select: { tipoServico: true };
  }>["tipoServico"];
  qtdPassageiros: number;
  clienteId: string | null;
  leadNome: string | null;
  leadTelefone: string | null;
  createdAt: Date;
  cliente: {
    id: string;
    nome: string;
    cpfCnpj: string;
  } | null;
};

export type AtendimentoListagemPaginada = {
  itens: AtendimentoListagemItem[];
  total: number;
  pagina: number;
  tamanho: number;
  totalPaginas: number;
};

export type AtendimentoFilaOrcamentoItem = {
  id: string;
  codigo: string | null;
  status: StatusAtendimento;
  dataServico: Date | null;
  leadNome: string | null;
  leadTelefone: string | null;
  createdAt: Date;
  cliente: {
    id: string;
    nome: string;
    cpfCnpj: string;
  } | null;
  orcamento: {
    validoAte: Date;
  } | null;
};

export type AtendimentoFilaReservaItem = {
  id: string;
  codigo: string | null;
  status: StatusAtendimento;
  dataServico: Date | null;
  leadNome: string | null;
  leadTelefone: string | null;
  createdAt: Date;
  cliente: {
    id: string;
    nome: string;
    cpfCnpj: string;
  } | null;
};

type PrismaExecutor = typeof prisma | Prisma.TransactionClient;

const MAX_TENTATIVAS_CODIGO = 5;

function ehConflitoCodigo(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false;
  }

  if (error.code !== "P2002") {
    return false;
  }

  const alvo = error.meta?.target;
  if (!Array.isArray(alvo)) {
    return false;
  }

  return alvo.includes("codigo");
}

function montarWhere(filtros: Omit<AtendimentoFiltros, "pagina" | "tamanho">) {
  const { busca, status, clienteId, dataServicoDe, dataServicoAte } = filtros;
  const buscaNormalizada = busca?.trim();

  return {
    ...(status && { status }),
    ...(clienteId && { clienteId }),
    ...(buscaNormalizada && {
      OR: [
        { codigo: { contains: buscaNormalizada, mode: "insensitive" } },
        { leadNome: { contains: buscaNormalizada, mode: "insensitive" } },
        {
          cliente: {
            is: {
              nome: { contains: buscaNormalizada, mode: "insensitive" },
            },
          },
        },
      ],
    }),
    ...((dataServicoDe || dataServicoAte) && {
      dataServico: {
        ...(dataServicoDe && { gte: dataServicoDe }),
        ...(dataServicoAte && { lte: dataServicoAte }),
      },
    }),
  } satisfies Prisma.AtendimentoWhereInput;
}

function obterClientePrisma(executor: PrismaExecutor) {
  return executor.atendimento;
}

const SELECT_FILA_BASE = {
  id: true,
  codigo: true,
  status: true,
  dataServico: true,
  leadNome: true,
  leadTelefone: true,
  createdAt: true,
  cliente: {
    select: {
      id: true,
      nome: true,
      cpfCnpj: true,
    },
  },
} as const;

export const atendimentoRepository = {
  listar(filtros: AtendimentoFiltros = {}) {
    const { pagina = 1, tamanho = 20 } = filtros;

    return prisma.atendimento.findMany({
      where: montarWhere(filtros),
      select: {
        id: true,
        codigo: true,
        status: true,
        dataContato: true,
        dataServico: true,
        tipoServico: true,
        qtdPassageiros: true,
        clienteId: true,
        leadNome: true,
        leadTelefone: true,
        createdAt: true,
        cliente: {
          select: {
            id: true,
            nome: true,
            cpfCnpj: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
      skip: (pagina - 1) * tamanho,
      take: tamanho,
    });
  },

  async listarPaginado(
    filtros: AtendimentoFiltros = {},
  ): Promise<AtendimentoListagemPaginada> {
    const { pagina = 1, tamanho = 20 } = filtros;
    const where = montarWhere(filtros);

    const [itens, total] = await prisma.$transaction([
      prisma.atendimento.findMany({
        where,
        select: {
          id: true,
          codigo: true,
          status: true,
          dataContato: true,
          dataServico: true,
          tipoServico: true,
          qtdPassageiros: true,
          clienteId: true,
          leadNome: true,
          leadTelefone: true,
          createdAt: true,
          cliente: {
            select: {
              id: true,
              nome: true,
              cpfCnpj: true,
            },
          },
        },
        orderBy: [{ createdAt: "desc" }],
        skip: (pagina - 1) * tamanho,
        take: tamanho,
      }),
      prisma.atendimento.count({ where }),
    ]);

    return {
      itens,
      total,
      pagina,
      tamanho,
      totalPaginas: Math.max(1, Math.ceil(total / tamanho)),
    };
  },

  async listarFilaOrcamentos(
    referencia = new Date(),
  ): Promise<AtendimentoFilaOrcamentoItem[]> {
    const [aguardandoOrcamento, aguardandoAprovacao] =
      await prisma.$transaction([
        prisma.atendimento.findMany({
          where: { status: "AGUARDANDO_ORCAMENTO" },
          select: {
            ...SELECT_FILA_BASE,
            orcamento: { select: { validoAte: true } },
          },
          orderBy: [{ createdAt: "asc" }],
        }),
        prisma.atendimento.findMany({
          where: {
            status: "ORCAMENTO_REGISTRADO_AG_APROVACAO",
            orcamento: {
              is: {
                validoAte: { gte: referencia },
              },
            },
          },
          select: {
            ...SELECT_FILA_BASE,
            orcamento: { select: { validoAte: true } },
          },
        }),
      ]);

    const aprovacaoOrdenada = aguardandoAprovacao.sort((a, b) => {
      const validadeA =
        a.orcamento?.validoAte?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const validadeB =
        b.orcamento?.validoAte?.getTime() ?? Number.MAX_SAFE_INTEGER;

      if (validadeA !== validadeB) {
        return validadeA - validadeB;
      }

      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    return [...aguardandoOrcamento, ...aprovacaoOrdenada];
  },

  async listarFilaReservas(
    referencia = new Date(),
  ): Promise<AtendimentoFilaReservaItem[]> {
    const limite = addDays(referencia, 7);
    const itens = await prisma.atendimento.findMany({
      where: {
        OR: [
          {
            status: {
              in: ["AGUARDANDO_RESERVA", "RESERVA_REGISTRADA_AG_ESCALA"],
            },
          },
          {
            status: "ESCALA_DEFINIDA",
            dataServico: {
              gte: referencia,
              lte: limite,
            },
          },
        ],
      },
      select: SELECT_FILA_BASE,
    });

    return itens.sort((a, b) => {
      if (!a.dataServico && !b.dataServico) {
        return a.createdAt.getTime() - b.createdAt.getTime();
      }

      if (!a.dataServico) {
        return 1;
      }

      if (!b.dataServico) {
        return -1;
      }

      const diferencaDataServico =
        a.dataServico.getTime() - b.dataServico.getTime();

      if (diferencaDataServico !== 0) {
        return diferencaDataServico;
      }

      return a.createdAt.getTime() - b.createdAt.getTime();
    });
  },

  contar(filtros: Omit<AtendimentoFiltros, "pagina" | "tamanho"> = {}) {
    return prisma.atendimento.count({ where: montarWhere(filtros) });
  },

  buscarPorId(id: string) {
    return prisma.atendimento.findUnique({
      where: { id },
      include: {
        cliente: true,
        criadoPorUsuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
            ativo: true,
          },
        },
        canceladoPorUsuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
            ativo: true,
          },
        },
      },
    });
  },

  buscarPorCodigo(codigo: string) {
    return prisma.atendimento.findUnique({ where: { codigo } });
  },

  buscarComEtapas(id: string) {
    return prisma.atendimento.findUnique({
      where: { id },
      include: {
        cliente: true,
        orcamento: true,
        reserva: true,
        escala: {
          include: {
            motoristas: { include: { motorista: true } },
            veiculos: { include: { veiculo: true } },
            parceiros: { include: { parceiro: true } },
          },
        },
        contratos: {
          where: { ativo: true },
          orderBy: { geradoEm: "desc" },
        },
      },
    });
  },

  async proximaSequenciaPorAno(ano: number, executor: PrismaExecutor = prisma) {
    const prefixo = `ATD-${ano}-`;
    const ultimo = await obterClientePrisma(executor).findFirst({
      where: {
        codigo: {
          startsWith: prefixo,
        },
      },
      orderBy: { codigo: "desc" },
      select: { codigo: true },
    });

    if (!ultimo?.codigo) {
      return 1;
    }

    const sequencia = Number(ultimo.codigo.split("-").at(-1));
    if (!Number.isFinite(sequencia)) {
      return 1;
    }

    return sequencia + 1;
  },

  criar(
    dados:
      | Prisma.AtendimentoCreateInput
      | Prisma.AtendimentoUncheckedCreateInput,
    executor: PrismaExecutor = prisma,
  ) {
    return obterClientePrisma(executor).create({ data: dados });
  },

  atualizar(
    id: string,
    dados:
      | Prisma.AtendimentoUpdateInput
      | Prisma.AtendimentoUncheckedUpdateInput,
    executor: PrismaExecutor = prisma,
  ) {
    return obterClientePrisma(executor).update({ where: { id }, data: dados });
  },

  async criarComCodigo(
    ano: number,
    dados:
      | Prisma.AtendimentoCreateInput
      | Prisma.AtendimentoUncheckedCreateInput,
  ) {
    for (let tentativa = 0; tentativa < MAX_TENTATIVAS_CODIGO; tentativa += 1) {
      try {
        return await prisma.$transaction(async (tx) => {
          const sequencia = await this.proximaSequenciaPorAno(ano, tx);
          const codigo = gerarCodigoAtendimento(ano, sequencia);

          return this.criar(
            {
              ...dados,
              codigo,
            },
            tx,
          );
        });
      } catch (error) {
        if (ehConflitoCodigo(error)) {
          continue;
        }

        throw error;
      }
    }

    throw new ConflictError(
      "CODIGO_ATENDIMENTO_INDISPONIVEL",
      "Nao foi possivel gerar um codigo unico para o atendimento.",
    );
  },
};
