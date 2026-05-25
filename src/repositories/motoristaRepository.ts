import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type MotoristaFiltros = {
  busca?: string;
  apenasAtivos?: boolean;
  apenasComCnhValida?: boolean;
  ordenarPor?: MotoristaOrdenacao;
  pagina?: number;
  tamanho?: number;
};

export type MotoristaOrdenacao =
  | "NOME_ASC"
  | "NOME_DESC"
  | "CRIADO_EM_DESC"
  | "CRIADO_EM_ASC"
  | "CNH_VALIDADE_ASC"
  | "CNH_VALIDADE_DESC";

function inicioHojeUtc() {
  const agora = new Date();

  return new Date(
    Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate()),
  );
}

function montarOrderBy(
  ordenarPor: MotoristaOrdenacao = "NOME_ASC",
): Prisma.MotoristaOrderByWithRelationInput {
  switch (ordenarPor) {
    case "NOME_DESC":
      return { nome: "desc" };
    case "CRIADO_EM_DESC":
      return { createdAt: "desc" };
    case "CRIADO_EM_ASC":
      return { createdAt: "asc" };
    case "CNH_VALIDADE_ASC":
      return { cnhValidade: "asc" };
    case "CNH_VALIDADE_DESC":
      return { cnhValidade: "desc" };
    case "NOME_ASC":
    default:
      return { nome: "asc" };
  }
}

function montarWhere(
  filtros: Pick<
    MotoristaFiltros,
    "busca" | "apenasAtivos" | "apenasComCnhValida"
  >,
) {
  const { busca, apenasAtivos = true, apenasComCnhValida = false } = filtros;

  return {
    ...(apenasAtivos && { ativo: true }),
    ...(apenasComCnhValida && { cnhValidade: { gte: inicioHojeUtc() } }),
    ...(busca && {
      OR: [
        { nome: { contains: busca, mode: "insensitive" } },
        { cpf: { contains: busca } },
      ],
    }),
  } satisfies Prisma.MotoristaWhereInput;
}

export const motoristaRepository = {
  listar(filtros: MotoristaFiltros = {}) {
    const { pagina = 1, tamanho = 20, ordenarPor = "NOME_ASC" } = filtros;

    return prisma.motorista.findMany({
      where: montarWhere(filtros),
      orderBy: montarOrderBy(ordenarPor),
      skip: (pagina - 1) * tamanho,
      take: tamanho,
    });
  },

  contar(
    filtros: Pick<
      MotoristaFiltros,
      "busca" | "apenasAtivos" | "apenasComCnhValida"
    > = {},
  ) {
    return prisma.motorista.count({ where: montarWhere(filtros) });
  },

  buscarPorId(id: string) {
    return prisma.motorista.findUnique({ where: { id } });
  },

  buscarPorCpf(cpf: string) {
    return prisma.motorista.findUnique({ where: { cpf } });
  },

  listarComCnhVencendo(diasAntes: number) {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() + diasAntes);

    return prisma.motorista.findMany({
      where: {
        ativo: true,
        cnhValidade: { lte: dataLimite },
      },
      orderBy: { cnhValidade: "asc" },
    });
  },

  criar(
    dados: Prisma.MotoristaCreateInput | Prisma.MotoristaUncheckedCreateInput,
  ) {
    return prisma.motorista.create({ data: dados });
  },

  atualizar(
    id: string,
    dados: Prisma.MotoristaUpdateInput | Prisma.MotoristaUncheckedUpdateInput,
  ) {
    return prisma.motorista.update({ where: { id }, data: dados });
  },

  ativar(id: string) {
    return prisma.motorista.update({ where: { id }, data: { ativo: true } });
  },

  desativar(id: string) {
    return prisma.motorista.update({ where: { id }, data: { ativo: false } });
  },

  contarAtendimentosVinculados(motoristaId: string) {
    return prisma.escalaMotorista.count({
      where: {
        motoristaId,
        escala: {
          atendimento: {
            status: {
              notIn: [
                "ORCAMENTO_CANCELADO",
                "RESERVA_CANCELADA",
                "ATENDIMENTO_CANCELADO",
              ],
            },
          },
        },
      },
    });
  },

  excluir(id: string) {
    return prisma.motorista.delete({ where: { id } });
  },
};
