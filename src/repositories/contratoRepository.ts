import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const contratoRepository = {
  async findAll() {
    return prisma.contrato.findMany({ include: { atendimento: true } });
  },

  async findByAtendimento(atendimentoId: string) {
    return prisma.contrato.findUnique({ where: { atendimentoId } });
  },

  async create(dados: Prisma.ContratoUncheckedCreateInput) {
    return prisma.contrato.create({ data: dados });
  },

  async update(id: string, dados: Prisma.ContratoUncheckedUpdateInput) {
    return prisma.contrato.update({ where: { id }, data: dados });
  },
};
