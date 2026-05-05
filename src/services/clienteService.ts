import type { Prisma } from "@prisma/client";
import { clienteRepository } from "@/repositories/clienteRepository";

export const clienteService = {
  async listarTodos() {
    return clienteRepository.findAll();
  },

  async buscarPorId(id: string) {
    return clienteRepository.findById(id);
  },

  async criar(dados: Prisma.ClienteUncheckedCreateInput) {
    return clienteRepository.create(dados);
  },

  async atualizar(id: string, dados: Prisma.ClienteUncheckedUpdateInput) {
    return clienteRepository.update(id, dados);
  },

  async deletar(id: string) {
    return clienteRepository.delete(id);
  },
};
