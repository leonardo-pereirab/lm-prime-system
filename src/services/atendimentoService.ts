import {
  InvalidTransitionError,
  NotFoundError,
  ValidationError,
} from "@/domain/errors";
import { podeTransicionar } from "@/domain/status";
import {
  atendimentoRepository,
  type AtendimentoFiltros,
} from "@/repositories/atendimentoRepository";
import type {
  AtendimentoUpdate,
  SolicitacaoInput,
} from "@/schemas/atendimento";
import type { Prisma, StatusAtendimento } from "@prisma/client";

const STATUS_CANCELAMENTO_VALIDOS: StatusAtendimento[] = [
  "ORCAMENTO_CANCELADO",
  "RESERVA_CANCELADA",
  "ATENDIMENTO_CANCELADO",
];

async function obterAtendimentoOuFalhar(id: string) {
  const atendimento = await atendimentoRepository.buscarComEtapas(id);

  if (!atendimento) {
    throw new NotFoundError(
      "ATENDIMENTO_NAO_ENCONTRADO",
      "Atendimento não encontrado.",
    );
  }

  return atendimento;
}

function validarTransicao(
  atual: StatusAtendimento,
  destino: StatusAtendimento,
  mensagem: string,
) {
  if (!podeTransicionar(atual, destino)) {
    throw new InvalidTransitionError("TRANSICAO_INVALIDA", mensagem);
  }
}

export const atendimentoService = {
  async criar(
    input:
      | SolicitacaoInput
      | (Prisma.AtendimentoUncheckedCreateInput & { criadoPor?: string }),
    userId?: string,
  ) {
    const criadoPor =
      userId ?? ("criadoPor" in input ? input.criadoPor : undefined);

    if (!criadoPor) {
      throw new ValidationError(
        "USUARIO_OBRIGATORIO",
        "Usuário responsável pela criação do atendimento é obrigatório.",
      );
    }

    const ano = new Date().getFullYear();
    return atendimentoRepository.criarComCodigo(ano, {
      ...input,
      status: "EM_SOLICITACAO",
      criadoPor,
    });
  },

  async listar(filtros: AtendimentoFiltros = {}) {
    return atendimentoRepository.listarPaginado(filtros);
  },

  async listarTodos() {
    const resposta = await this.listar();
    return resposta.itens;
  },

  async buscarPorId(id: string) {
    return obterAtendimentoOuFalhar(id);
  },

  async atualizarSolicitacao(id: string, input: AtendimentoUpdate) {
    const atendimento = await obterAtendimentoOuFalhar(id);

    if (atendimento.status !== "EM_SOLICITACAO") {
      throw new InvalidTransitionError(
        "ETAPA_INVALIDA",
        "Solicitação só pode ser editada enquanto o atendimento estiver em solicitação.",
      );
    }

    return atendimentoRepository.atualizar(id, input);
  },

  async atualizar(id: string, input: Prisma.AtendimentoUncheckedUpdateInput) {
    return atendimentoRepository.atualizar(id, input);
  },

  async avancarParaOrcamento(id: string) {
    const atendimento = await obterAtendimentoOuFalhar(id);

    validarTransicao(
      atendimento.status,
      "AGUARDANDO_ORCAMENTO",
      "Não é possível avançar para orçamento a partir do status atual.",
    );

    return atendimentoRepository.atualizar(id, {
      status: "AGUARDANDO_ORCAMENTO",
    });
  },

  async avancarParaReserva(id: string) {
    const atendimento = await obterAtendimentoOuFalhar(id);

    validarTransicao(
      atendimento.status,
      "AGUARDANDO_RESERVA",
      "Não é possível avançar para reserva sem orçamento aprovado.",
    );

    return atendimentoRepository.atualizar(id, {
      status: "AGUARDANDO_RESERVA",
    });
  },

  async avancarParaEscala(id: string) {
    const atendimento = await obterAtendimentoOuFalhar(id);

    if (atendimento.status !== "RESERVA_REGISTRADA_AG_ESCALA") {
      throw new InvalidTransitionError(
        "ETAPA_INVALIDA",
        "Atendimento não está na etapa de escala.",
      );
    }

    return atendimento;
  },

  async iniciarServico(id: string) {
    const atendimento = await obterAtendimentoOuFalhar(id);

    validarTransicao(
      atendimento.status,
      "SERVICO_EM_ANDAMENTO",
      "Não é possível iniciar serviço no status atual.",
    );

    return atendimentoRepository.atualizar(id, {
      status: "SERVICO_EM_ANDAMENTO",
    });
  },

  async finalizarServico(id: string) {
    const atendimento = await obterAtendimentoOuFalhar(id);

    validarTransicao(
      atendimento.status,
      "SERVICO_FINALIZADO",
      "Não é possível finalizar serviço no status atual.",
    );

    return atendimentoRepository.atualizar(id, {
      status: "SERVICO_FINALIZADO",
    });
  },

  async cancelar(id: string, etapa: StatusAtendimento, userId: string) {
    const atendimento = await obterAtendimentoOuFalhar(id);

    if (!STATUS_CANCELAMENTO_VALIDOS.includes(etapa)) {
      throw new ValidationError(
        "STATUS_CANCELAMENTO_INVALIDO",
        "Status de cancelamento inválido.",
      );
    }

    validarTransicao(
      atendimento.status,
      etapa,
      "Não é possível cancelar o atendimento na etapa informada.",
    );

    return atendimentoRepository.atualizar(id, {
      status: etapa,
      statusAnteriorCancelamento: atendimento.status,
      canceladoEm: new Date(),
      canceladoPor: userId,
    });
  },
};
