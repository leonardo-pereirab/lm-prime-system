import type { Prisma } from "@prisma/client";
import { motoristaRepository } from "@/repositories/motoristaRepository";

export const motoristaService = {
  async listarTodos() {
    return motoristaRepository.findAll();
  },

  async buscarPorId(id: string) {
    return motoristaRepository.findById(id);
  },

  async criar(dados: Prisma.MotoristaUncheckedCreateInput) {
    return motoristaRepository.create(dados);
  },

  async atualizar(id: string, dados: Prisma.MotoristaUncheckedUpdateInput) {
    return motoristaRepository.update(id, dados);
  },

  async deletar(id: string) {
    return motoristaRepository.delete(id);
  },
};
