import type { Prisma } from "@prisma/client";
import { escalaRepository } from "@/repositories/escalaRepository";

export const escalaService = {
  async listarTodas() {
    return escalaRepository.findAll();
  },

  async buscarPorAtendimento(atendimentoId: string) {
    return escalaRepository.findByAtendimento(atendimentoId);
  },

  async atribuir(dados: Prisma.EscalaUncheckedCreateInput) {
    return escalaRepository.create(dados);
  },

  async atualizar(id: string, dados: Prisma.EscalaUncheckedUpdateInput) {
    return escalaRepository.update(id, dados);
  },
};
