import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type UsuarioFiltros = {
  busca?: string;
  apenasAtivos?: boolean;
  pagina?: number;
  tamanho?: number;
};

const usuarioSemSenhaSelect = {
  id: true,
  nome: true,
  email: true,
  perfil: true,
  ativo: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UsuarioSelect;

function montarWhere(filtros: Pick<UsuarioFiltros, "busca" | "apenasAtivos">) {
  const { busca, apenasAtivos = true } = filtros;

  return {
    ...(apenasAtivos && { ativo: true }),
    ...(busca && {
      OR: [
        { nome: { contains: busca, mode: "insensitive" } },
        { email: { contains: busca, mode: "insensitive" } },
      ],
    }),
  } satisfies Prisma.UsuarioWhereInput;
}

export const usuarioRepository = {
  listar(filtros: UsuarioFiltros = {}) {
    const { pagina = 1, tamanho = 20 } = filtros;

    return prisma.usuario.findMany({
      where: montarWhere(filtros),
      select: usuarioSemSenhaSelect,
      orderBy: { nome: "asc" },
      skip: (pagina - 1) * tamanho,
      take: tamanho,
    });
  },

  contar(filtros: Pick<UsuarioFiltros, "busca" | "apenasAtivos"> = {}) {
    return prisma.usuario.count({ where: montarWhere(filtros) });
  },

  buscarPorId(id: string) {
    return prisma.usuario.findUnique({
      where: { id },
      select: usuarioSemSenhaSelect,
    });
  },

  buscarPorEmail(email: string) {
    return prisma.usuario.findUnique({
      where: { email },
      select: usuarioSemSenhaSelect,
    });
  },

  buscarComSenhaPorEmail(email: string) {
    return prisma.usuario.findUnique({ where: { email } });
  },

  criar(dados: Prisma.UsuarioCreateInput | Prisma.UsuarioUncheckedCreateInput) {
    return prisma.usuario.create({
      data: dados,
      select: usuarioSemSenhaSelect,
    });
  },

  atualizar(
    id: string,
    dados: Prisma.UsuarioUpdateInput | Prisma.UsuarioUncheckedUpdateInput,
  ) {
    return prisma.usuario.update({
      where: { id },
      data: dados,
      select: usuarioSemSenhaSelect,
    });
  },

  desativar(id: string) {
    return prisma.usuario.update({
      where: { id },
      data: { ativo: false },
      select: usuarioSemSenhaSelect,
    });
  },

  async contarVinculos(id: string) {
    const [atendimentosCriados, atendimentosCancelados, contratosGerados] =
      await Promise.all([
        prisma.atendimento.count({ where: { criadoPor: id } }),
        prisma.atendimento.count({ where: { canceladoPor: id } }),
        prisma.contrato.count({ where: { geradoPor: id } }),
      ]);

    return atendimentosCriados + atendimentosCancelados + contratosGerados;
  },

  excluir(id: string) {
    return prisma.usuario.delete({
      where: { id },
      select: usuarioSemSenhaSelect,
    });
  },
};
