import { prisma } from "@/lib/prisma";
import type {
  ClassificacaoFuncionario,
  EstadoFuncionario,
  Prisma,
} from "@prisma/client";

export type FuncionarioFiltros = {
  busca?: string;
  estado?: EstadoFuncionario;
  classificacao?: ClassificacaoFuncionario;
  pagina?: number;
  tamanho?: number;
};

export type FuncionarioOrdenacao =
  | "NOME_ASC"
  | "NOME_DESC"
  | "CRIADO_EM_DESC"
  | "CRIADO_EM_ASC";

function montarWhere(
  filtros: Pick<FuncionarioFiltros, "busca" | "estado" | "classificacao">,
) {
  const { busca, estado, classificacao } = filtros;

  return {
    ...(estado && { estado }),
    ...(classificacao && { classificacao }),
    ...(busca && {
      OR: [
        { nomeCompleto: { contains: busca, mode: "insensitive" } },
        { emailCorporativo: { contains: busca, mode: "insensitive" } },
        { matricula: { contains: busca, mode: "insensitive" } },
        { cpf: { contains: busca } },
      ],
    }),
  } satisfies Prisma.FuncionarioWhereInput;
}

function montarOrderBy(
  ordenacao: FuncionarioOrdenacao = "NOME_ASC",
): Prisma.FuncionarioOrderByWithRelationInput {
  switch (ordenacao) {
    case "NOME_DESC":
      return { nomeCompleto: "desc" };
    case "CRIADO_EM_DESC":
      return { createdAt: "desc" };
    case "CRIADO_EM_ASC":
      return { createdAt: "asc" };
    case "NOME_ASC":
    default:
      return { nomeCompleto: "asc" };
  }
}

const funcionarioComUsuarioSelect = {
  id: true,
  usuarioId: true,
  estado: true,
  classificacao: true,
  matricula: true,
  nomeCompleto: true,
  emailCorporativo: true,
  cpf: true,
  telefonePrincipal: true,
  telefoneAdicional: true,
  cep: true,
  logradouro: true,
  numero: true,
  complemento: true,
  bairro: true,
  cidade: true,
  estadoUf: true,
  aceitouTermosEm: true,
  versaoTermosAceita: true,
  anonimizadoEm: true,
  createdAt: true,
  updatedAt: true,
  usuario: {
    select: {
      id: true,
      nome: true,
      email: true,
      perfil: true,
      ativo: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.FuncionarioSelect;

export const funcionarioRepository = {
  listar(
    filtros: FuncionarioFiltros = {},
    ordenacao: FuncionarioOrdenacao = "NOME_ASC",
  ) {
    const { pagina = 1, tamanho = 20 } = filtros;

    return prisma.funcionario.findMany({
      where: montarWhere(filtros),
      orderBy: montarOrderBy(ordenacao),
      skip: (pagina - 1) * tamanho,
      take: tamanho,
      select: funcionarioComUsuarioSelect,
    });
  },

  contar(
    filtros: Pick<FuncionarioFiltros, "busca" | "estado" | "classificacao">,
  ) {
    return prisma.funcionario.count({ where: montarWhere(filtros) });
  },

  buscarPorId(id: string) {
    return prisma.funcionario.findUnique({
      where: { id },
      select: funcionarioComUsuarioSelect,
    });
  },

  buscarPorMatricula(matricula: string) {
    return prisma.funcionario.findUnique({
      where: { matricula },
      select: funcionarioComUsuarioSelect,
    });
  },

  buscarConvidadoPorEmailEMatricula(email: string, matricula: string) {
    return prisma.funcionario.findFirst({
      where: {
        emailCorporativo: email,
        matricula,
        estado: "CONVIDADO",
      },
      select: funcionarioComUsuarioSelect,
    });
  },

  criar(
    dados:
      | Prisma.FuncionarioCreateInput
      | Prisma.FuncionarioUncheckedCreateInput,
  ) {
    return prisma.funcionario.create({
      data: dados,
      select: funcionarioComUsuarioSelect,
    });
  },

  atualizar(
    id: string,
    dados:
      | Prisma.FuncionarioUpdateInput
      | Prisma.FuncionarioUncheckedUpdateInput,
  ) {
    return prisma.funcionario.update({
      where: { id },
      data: dados,
      select: funcionarioComUsuarioSelect,
    });
  },

  async excluir(id: string) {
    await prisma.funcionario.delete({ where: { id } });
  },
};
