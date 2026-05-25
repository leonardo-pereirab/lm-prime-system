import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type ReservaFiltros = {
  atendimentoId?: string;
  pagina?: number;
  tamanho?: number;
};

function montarWhere(filtros: Omit<ReservaFiltros, "pagina" | "tamanho">) {
  const { atendimentoId } = filtros;

  return {
    ...(atendimentoId && { atendimentoId }),
  } satisfies Prisma.ReservaWhereInput;
}

export const reservaRepository = {
  listar(filtros: ReservaFiltros = {}) {
    const { pagina = 1, tamanho = 20 } = filtros;

    return prisma.reserva.findMany({
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
            orcamento: true,
            escala: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (pagina - 1) * tamanho,
      take: tamanho,
    });
  },

  contar(filtros: Omit<ReservaFiltros, "pagina" | "tamanho"> = {}) {
    return prisma.reserva.count({ where: montarWhere(filtros) });
  },

  buscarPorId(id: string) {
    return prisma.reserva.findUnique({
      where: { id },
      include: {
        atendimento: {
          include: {
            cliente: true,
            orcamento: true,
            escala: true,
          },
        },
      },
    });
  },

  buscarPorAtendimentoId(atendimentoId: string) {
    return prisma.reserva.findUnique({ where: { atendimentoId } });
  },

  criar(dados: Prisma.ReservaCreateInput | Prisma.ReservaUncheckedCreateInput) {
    return prisma.reserva.create({ data: dados });
  },

  atualizar(
    id: string,
    dados: Prisma.ReservaUpdateInput | Prisma.ReservaUncheckedUpdateInput,
  ) {
    return prisma.reserva.update({ where: { id }, data: dados });
  },
};
