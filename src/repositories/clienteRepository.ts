import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const clienteRepository = {
  async findAll() {
    return prisma.cliente.findMany({ orderBy: { createdAt: "desc" } });
  },

  async findById(id: string) {
    return prisma.cliente.findUnique({ where: { id } });
  },

  async create(dados: Prisma.ClienteUncheckedCreateInput) {
    return prisma.cliente.create({ data: dados });
  },

  async update(id: string, dados: Prisma.ClienteUncheckedUpdateInput) {
    return prisma.cliente.update({ where: { id }, data: dados });
  },

  async delete(id: string) {
    return prisma.cliente.delete({ where: { id } });
  },
};
