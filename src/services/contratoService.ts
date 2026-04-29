import type { Prisma } from "@prisma/client";
import { contratoRepository } from "@/repositories/contratoRepository";

export const contratoService = {
  async listarTodos() {
    return contratoRepository.findAll();
  },

  async buscarPorAtendimento(atendimentoId: string) {
    return contratoRepository.findByAtendimento(atendimentoId);
  },

  async gerar(dados: Prisma.ContratoUncheckedCreateInput) {
    const texto = this._gerarTexto(dados);
    return contratoRepository.create({
      atendimentoId: dados.atendimentoId,
      textoGerado: texto,
    });
  },

  _gerarTexto(dados: Prisma.ContratoUncheckedCreateInput) {
    return `Contrato de prestacao de servicos - Atendimento #${dados.atendimentoId}`;
  },
};
