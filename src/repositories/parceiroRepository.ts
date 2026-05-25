import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type ParceiroFiltros = {
  busca?: string;
  apenasAtivos?: boolean;
  ordenarPor?: ParceiroOrdenacao;
  pagina?: number;
  tamanho?: number;
};

export type ParceiroOrdenacao =
  | "NOME_ASC"
  | "NOME_DESC"
  | "CRIADO_EM_DESC"
  | "CRIADO_EM_ASC";

function montarOrderBy(
  ordenarPor: ParceiroOrdenacao = "NOME_ASC",
): Prisma.ParceiroOrderByWithRelationInput {
  switch (ordenarPor) {
    case "NOME_DESC":
      return { nome: "desc" };
    case "CRIADO_EM_DESC":
      return { createdAt: "desc" };
    case "CRIADO_EM_ASC":
      return { createdAt: "asc" };
    case "NOME_ASC":
    default:
      return { nome: "asc" };
  }
}

function montarWhere(filtros: Pick<ParceiroFiltros, "busca" | "apenasAtivos">) {
  const { busca, apenasAtivos = true } = filtros;

  return {
    ...(apenasAtivos && { ativo: true }),
    ...(busca && {
      OR: [
        { nome: { contains: busca, mode: "insensitive" } },
        { cnpj: { contains: busca } },
      ],
    }),
  } satisfies Prisma.ParceiroWhereInput;
}

export const parceiroRepository = {
  listar(filtros: ParceiroFiltros = {}) {
    const { pagina = 1, tamanho = 20, ordenarPor = "NOME_ASC" } = filtros;

    return prisma.parceiro.findMany({
      where: montarWhere(filtros),
      orderBy: montarOrderBy(ordenarPor),
      skip: (pagina - 1) * tamanho,
      take: tamanho,
    });
  },

  contar(filtros: Pick<ParceiroFiltros, "busca" | "apenasAtivos"> = {}) {
    return prisma.parceiro.count({ where: montarWhere(filtros) });
  },

  buscarPorId(id: string) {
    return prisma.parceiro.findUnique({ where: { id } });
  },

  buscarPorCnpj(cnpj: string) {
    return prisma.parceiro.findUnique({ where: { cnpj } });
  },

  criar(
    dados: Prisma.ParceiroCreateInput | Prisma.ParceiroUncheckedCreateInput,
  ) {
    return prisma.parceiro.create({ data: dados });
  },

  atualizar(
    id: string,
    dados: Prisma.ParceiroUpdateInput | Prisma.ParceiroUncheckedUpdateInput,
  ) {
    return prisma.parceiro.update({ where: { id }, data: dados });
  },

  ativar(id: string) {
    return prisma.parceiro.update({ where: { id }, data: { ativo: true } });
  },

  desativar(id: string) {
    return prisma.parceiro.update({ where: { id }, data: { ativo: false } });
  },

  contarAtendimentosVinculados(parceiroId: string) {
    return prisma.escalaParceiro.count({
      where: {
        parceiroId,
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
    return prisma.parceiro.delete({ where: { id } });
  },
};
