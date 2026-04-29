import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const orcamentoRepository = {
  async findAll() {
    return prisma.orcamento.findMany({
      include: { atendimento: { include: { cliente: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id: string) {
    return prisma.orcamento.findUnique({
      where: { id },
      include: { atendimento: { include: { cliente: true } } },
    });
  },

  async findByAtendimentoId(atendimentoId: string) {
    return prisma.orcamento.findUnique({ where: { atendimentoId } });
  },

  async create(dados: Prisma.OrcamentoUncheckedCreateInput) {
    return prisma.orcamento.create({ data: dados });
  },

  async update(id: string, dados: Prisma.OrcamentoUncheckedUpdateInput) {
    return prisma.orcamento.update({ where: { id }, data: dados });
  },

  async delete(id: string) {
    return prisma.orcamento.delete({ where: { id } });
  },
};
