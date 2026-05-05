import type { Prisma } from "@prisma/client";
import { parceiroRepository } from "@/repositories/parceiroRepository";

export const parceiroService = {
  async listarTodos() {
    return parceiroRepository.findAll();
  },

  async buscarPorId(id: string) {
    return parceiroRepository.findById(id);
  },

  async criar(dados: Prisma.ParceiroUncheckedCreateInput) {
    return parceiroRepository.create(dados);
  },

  async atualizar(id: string, dados: Prisma.ParceiroUncheckedUpdateInput) {
    return parceiroRepository.update(id, dados);
  },

  async deletar(id: string) {
    return parceiroRepository.delete(id);
  },
};
