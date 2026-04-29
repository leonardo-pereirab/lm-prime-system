import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const atendimentoRepository = {
  async findAll() {
    return prisma.atendimento.findMany({
      include: { cliente: true, usuario: true, orcamento: true, reserva: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id: string) {
    return prisma.atendimento.findUnique({
      where: { id },
      include: {
        cliente: true,
        usuario: true,
        orcamento: true,
        reserva: { include: { cliente: true } },
        escala: { include: { motorista: true, veiculo: true, parceiro: true } },
        contrato: true,
      },
    });
  },

  async findByCodigo(codigo: string) {
    return prisma.atendimento.findUnique({ where: { codigo } });
  },

  async create(dados: Prisma.AtendimentoUncheckedCreateInput) {
    return prisma.atendimento.create({ data: dados });
  },

  async update(id: string, dados: Prisma.AtendimentoUncheckedUpdateInput) {
    return prisma.atendimento.update({ where: { id }, data: dados });
  },

  async delete(id: string) {
    return prisma.atendimento.delete({ where: { id } });
  },
};
