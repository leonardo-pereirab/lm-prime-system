import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const veiculoRepository = {
  async findAll() {
    return prisma.veiculo.findMany({ orderBy: { modelo: "asc" } });
  },

  async findById(id: string) {
    return prisma.veiculo.findUnique({ where: { id } });
  },

  async create(dados: Prisma.VeiculoUncheckedCreateInput) {
    return prisma.veiculo.create({ data: dados });
  },

  async update(id: string, dados: Prisma.VeiculoUncheckedUpdateInput) {
    return prisma.veiculo.update({ where: { id }, data: dados });
  },

  async delete(id: string) {
    return prisma.veiculo.delete({ where: { id } });
  },
};
