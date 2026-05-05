import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const parceiroRepository = {
  async findAll() {
    return prisma.parceiro.findMany({ orderBy: { razaoSocial: "asc" } });
  },

  async findById(id: string) {
    return prisma.parceiro.findUnique({ where: { id } });
  },

  async create(dados: Prisma.ParceiroUncheckedCreateInput) {
    return prisma.parceiro.create({ data: dados });
  },

  async update(id: string, dados: Prisma.ParceiroUncheckedUpdateInput) {
    return prisma.parceiro.update({ where: { id }, data: dados });
  },

  async delete(id: string) {
    return prisma.parceiro.delete({ where: { id } });
  },
};
