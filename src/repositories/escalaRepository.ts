import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const escalaRepository = {
  async findAll() {
    return prisma.escala.findMany({
      include: { motorista: true, veiculo: true, atendimento: true },
      orderBy: { createdAt: "asc" },
    });
  },

  async findByAtendimento(atendimentoId: string) {
    return prisma.escala.findUnique({ where: { atendimentoId } });
  },

  async create(dados: Prisma.EscalaUncheckedCreateInput) {
    return prisma.escala.create({ data: dados });
  },

  async update(id: string, dados: Prisma.EscalaUncheckedUpdateInput) {
    return prisma.escala.update({ where: { id }, data: dados });
  },
};
