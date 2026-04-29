import type { Prisma } from "@prisma/client";
import { veiculoRepository } from "@/repositories/veiculoRepository";

export const veiculoService = {
  async listarTodos() {
    return veiculoRepository.findAll();
  },

  async buscarPorId(id: string) {
    return veiculoRepository.findById(id);
  },

  async criar(dados: Prisma.VeiculoUncheckedCreateInput) {
    return veiculoRepository.create(dados);
  },

  async atualizar(id: string, dados: Prisma.VeiculoUncheckedUpdateInput) {
    return veiculoRepository.update(id, dados);
  },

  async deletar(id: string) {
    return veiculoRepository.delete(id);
  },
};
