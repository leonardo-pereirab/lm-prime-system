import type { Prisma } from "@prisma/client";
import { reservaRepository } from "@/repositories/reservaRepository";
import { atendimentoRepository } from "@/repositories/atendimentoRepository";

export const reservaService = {
  async listarTodos() {
    return reservaRepository.findAll();
  },

  async buscarPorId(id: string) {
    return reservaRepository.findById(id);
  },

  async buscarPorAtendimento(atendimentoId: string) {
    return reservaRepository.findByAtendimentoId(atendimentoId);
  },

  async criar(dados: Prisma.ReservaUncheckedCreateInput) {
    if (!dados.clienteId) {
      throw new Error("Cliente e obrigatorio para confirmar uma reserva.");
    }
    const reserva = await reservaRepository.create(dados);
    await atendimentoRepository.update(dados.atendimentoId, {
      status: "RESERVA_REGISTRADA_AG_ESCALA",
      clienteId: dados.clienteId,
    });
    return reserva;
  },

  async atualizar(id: string, dados: Prisma.ReservaUncheckedUpdateInput) {
    return reservaRepository.update(id, dados);
  },

  async deletar(id: string) {
    return reservaRepository.delete(id);
  },
};
