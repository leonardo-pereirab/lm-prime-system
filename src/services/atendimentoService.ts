import type { Prisma, StatusAtendimento } from "@prisma/client";
import { atendimentoRepository } from "@/repositories/atendimentoRepository";

export const atendimentoService = {
  async listarTodos() {
    return atendimentoRepository.findAll();
  },

  async buscarPorId(id: string) {
    return atendimentoRepository.findById(id);
  },

  async criar(dados: Prisma.AtendimentoUncheckedCreateInput) {
    return atendimentoRepository.create({ ...dados, status: "EM_SOLICITACAO" });
  },

  async atualizar(id: string, dados: Prisma.AtendimentoUncheckedUpdateInput) {
    return atendimentoRepository.update(id, dados);
  },

  async avancarParaAguardandoOrcamento(id: string) {
    return atendimentoRepository.update(id, { status: "AGUARDANDO_ORCAMENTO" });
  },

  async registrarOrcamento(id: string) {
    return atendimentoRepository.update(id, {
      status: "ORCAMENTO_REGISTRADO_AG_APROVACAO",
    });
  },

  async aprovarOrcamento(id: string) {
    return atendimentoRepository.update(id, { status: "AGUARDANDO_RESERVA" });
  },

  async confirmarReserva(id: string) {
    return atendimentoRepository.update(id, {
      status: "RESERVA_REGISTRADA_AG_ESCALA",
    });
  },

  async definirEscala(id: string) {
    return atendimentoRepository.update(id, { status: "ESCALA_DEFINIDA" });
  },

  async iniciarServico(id: string) {
    return atendimentoRepository.update(id, { status: "SERVICO_EM_ANDAMENTO" });
  },

  async concluir(id: string) {
    return atendimentoRepository.update(id, {
      status: "SERVICO_FINALIZADO",
      encerradoEm: new Date(),
    });
  },

  async cancelar(
    id: string,
    tipo: StatusAtendimento = "ATENDIMENTO_CANCELADO",
  ) {
    return atendimentoRepository.update(id, { status: tipo });
  },

  async deletar(id: string) {
    return atendimentoRepository.delete(id);
  },
};
