import { ConflictError } from "@/domain/errors";
import { gerarCodigoAtendimento } from "@/domain/helpers";
import { prisma } from "@/lib/prisma";
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
