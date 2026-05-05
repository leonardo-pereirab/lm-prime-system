import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const reservaRepository = {
  async findAll() {
    return prisma.reserva.findMany({
      include: { atendimento: true, cliente: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id: string) {
    return prisma.reserva.findUnique({
      where: { id },
      include: {
        atendimento: { include: { orcamento: true, escala: true } },
        cliente: true,
      },
    });
  },

  async findByAtendimentoId(atendimentoId: string) {
    return prisma.reserva.findUnique({ where: { atendimentoId } });
  },

  async create(dados: Prisma.ReservaUncheckedCreateInput) {
    return prisma.reserva.create({ data: dados });
  },

  async update(id: string, dados: Prisma.ReservaUncheckedUpdateInput) {
    return prisma.reserva.update({ where: { id }, data: dados });
  },

  async delete(id: string) {
    return prisma.reserva.delete({ where: { id } });
  },
};
