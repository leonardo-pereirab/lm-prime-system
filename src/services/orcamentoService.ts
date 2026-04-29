import type { Prisma } from "@prisma/client";
import { orcamentoRepository } from "@/repositories/orcamentoRepository";
import { atendimentoRepository } from "@/repositories/atendimentoRepository";

export const orcamentoService = {
  async listarTodos() {
    return orcamentoRepository.findAll();
  },

  async buscarPorId(id: string) {
    return orcamentoRepository.findById(id);
  },

  async buscarPorAtendimento(atendimentoId: string) {
    return orcamentoRepository.findByAtendimentoId(atendimentoId);
  },

  async criar(dados: Prisma.OrcamentoUncheckedCreateInput) {
    const validoAte = new Date();
    validoAte.setDate(validoAte.getDate() + 7);
    const orcamento = await orcamentoRepository.create({ ...dados, validoAte });
    await atendimentoRepository.update(dados.atendimentoId, {
      status: "ORCAMENTO_REGISTRADO_AG_APROVACAO",
    });
    return orcamento;
  },

  async atualizar(id: string, dados: Prisma.OrcamentoUncheckedUpdateInput) {
    return orcamentoRepository.update(id, dados);
  },

  async deletar(id: string) {
    return orcamentoRepository.delete(id);
  },
};
