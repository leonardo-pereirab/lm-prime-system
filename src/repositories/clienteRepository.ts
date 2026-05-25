import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type ClienteFiltros = {
  busca?: string;
  apenasAtivos?: boolean;
  ordenarPor?: ClienteOrdenacao;
  pagina?: number;
  tamanho?: number;
};

export type ClienteOrdenacao =
  | "NOME_ASC"
  | "NOME_DESC"
  | "CRIADO_EM_DESC"
  | "CRIADO_EM_ASC";

function montarOrderBy(
  ordenarPor: ClienteOrdenacao = "NOME_ASC",
): Prisma.ClienteOrderByWithRelationInput {
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

function montarWhere(filtros: Pick<ClienteFiltros, "busca" | "apenasAtivos">) {
  const { busca, apenasAtivos = true } = filtros;

  return {
    ...(apenasAtivos && { ativo: true }),
    ...(busca && {
      OR: [
        { nome: { contains: busca, mode: "insensitive" } },
        { cpfCnpj: { contains: busca } },
      ],
    }),
  } satisfies Prisma.ClienteWhereInput;
}

export const clienteRepository = {
  listar(filtros: ClienteFiltros = {}) {
    const { pagina = 1, tamanho = 20, ordenarPor = "NOME_ASC" } = filtros;

    return prisma.cliente.findMany({
      where: montarWhere(filtros),
      orderBy: montarOrderBy(ordenarPor),
      skip: (pagina - 1) * tamanho,
      take: tamanho,
    });
  },

  contar(filtros: Pick<ClienteFiltros, "busca" | "apenasAtivos"> = {}) {
    return prisma.cliente.count({ where: montarWhere(filtros) });
  },

  buscarPorId(id: string) {
    return prisma.cliente.findUnique({ where: { id } });
  },

  buscarPorCpfCnpj(cpfCnpj: string) {
    return prisma.cliente.findUnique({ where: { cpfCnpj } });
  },

  criar(dados: Prisma.ClienteCreateInput | Prisma.ClienteUncheckedCreateInput) {
    return prisma.cliente.create({ data: dados });
  },

  atualizar(
    id: string,
    dados: Prisma.ClienteUpdateInput | Prisma.ClienteUncheckedUpdateInput,
  ) {
    return prisma.cliente.update({ where: { id }, data: dados });
  },

  ativar(id: string) {
    return prisma.cliente.update({ where: { id }, data: { ativo: true } });
  },

  desativar(id: string) {
    return prisma.cliente.update({ where: { id }, data: { ativo: false } });
  },

  excluir(id: string) {
    return prisma.cliente.delete({ where: { id } });
  },

  contarAtendimentos(clienteId: string) {
    return prisma.atendimento.count({ where: { clienteId } });
  },

  listarAtendimentosResumo(clienteId: string, limite = 10) {
    return prisma.atendimento.findMany({
      where: { clienteId },
      select: {
        id: true,
        codigo: true,
        status: true,
        dataServico: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: limite,
    });
  },
};
