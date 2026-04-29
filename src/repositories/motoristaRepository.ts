import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const motoristaRepository = {
  async findAll() {
    return prisma.motorista.findMany({ orderBy: { nome: "asc" } });
  },

  async findById(id: string) {
    return prisma.motorista.findUnique({ where: { id } });
  },

  async create(dados: Prisma.MotoristaUncheckedCreateInput) {
    return prisma.motorista.create({ data: dados });
  },

  async update(id: string, dados: Prisma.MotoristaUncheckedUpdateInput) {
    return prisma.motorista.update({ where: { id }, data: dados });
  },

  async delete(id: string) {
    return prisma.motorista.delete({ where: { id } });
  },
};
