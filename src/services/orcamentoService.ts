import {
  InvalidTransitionError,
  NotFoundError,
  ValidationError,
} from "@/domain/errors";
import { podeTransicionar } from "@/domain/status";
import { prisma } from "@/lib/prisma";
import {
  orcamentoRepository,
  type OrcamentoFiltros,
} from "@/repositories/orcamentoRepository";
import type { OrcamentoInput, OrcamentoUpdate } from "@/schemas/orcamento";
import { addDays } from "date-fns";
import type { Prisma, StatusAtendimento } from "@prisma/client";

const STATUS_TERMINAIS_ORCAMENTO = new Set<StatusAtendimento>([
  "ORCAMENTO_CANCELADO",
  "RESERVA_CANCELADA",
  "ATENDIMENTO_CANCELADO",
  "SERVICO_FINALIZADO",
]);

function normalizarData(data?: Date | string | null): Date | undefined {
  if (!data) {
    return undefined;
  }

  return data instanceof Date ? data : new Date(data);
}

export const orcamentoService = {
  async listar(filtros: OrcamentoFiltros = {}) {
    return orcamentoRepository.listar(filtros);
  },

  async listarTodos() {
    return this.listar();
  },

  async buscarPorId(id: string) {
    const orcamento = await orcamentoRepository.buscarPorId(id);

    if (!orcamento) {
      throw new NotFoundError(
        "ORCAMENTO_NAO_ENCONTRADO",
        "Orçamento não encontrado.",
      );
    }

    return orcamento;
  },

  async buscarPorAtendimento(atendimentoId: string) {
    const orcamento =
      await orcamentoRepository.buscarPorAtendimentoId(atendimentoId);

    if (!orcamento) {
      throw new NotFoundError(
        "ORCAMENTO_NAO_ENCONTRADO",
        "Orçamento não encontrado para o atendimento.",
      );
    }

    return orcamento;
  },

  async criar(
    atendimentoIdOuDados: string | Prisma.OrcamentoUncheckedCreateInput,
    input?: OrcamentoInput,
  ) {
    if (typeof atendimentoIdOuDados === "string" && !input) {
      throw new ValidationError(
        "DADOS_ORCAMENTO_OBRIGATORIOS",
        "Dados do orçamento são obrigatórios.",
      );
    }

    const atendimentoId =
      typeof atendimentoIdOuDados === "string"
        ? atendimentoIdOuDados
        : atendimentoIdOuDados.atendimentoId;

    const dadosOrcamento: OrcamentoInput =
      typeof atendimentoIdOuDados === "string"
        ? (input as OrcamentoInput)
        : {
            valorTotal: atendimentoIdOuDados.valorTotal as never,
            formaPagamento: atendimentoIdOuDados.formaPagamento,
            dataVencimento: normalizarData(atendimentoIdOuDados.dataVencimento),
            veiculosPrevistos: atendimentoIdOuDados.veiculosPrevistos as never,
            observacoes: atendimentoIdOuDados.observacoes ?? undefined,
          };

    const atendimento = await prisma.atendimento.findUnique({
      where: { id: atendimentoId },
      select: { id: true, status: true },
    });

    if (!atendimento) {
      throw new NotFoundError(
        "ATENDIMENTO_NAO_ENCONTRADO",
        "Atendimento não encontrado.",
      );
    }

    if (
      !podeTransicionar(atendimento.status, "ORCAMENTO_REGISTRADO_AG_APROVACAO")
    ) {
      throw new InvalidTransitionError(
        "TRANSICAO_INVALIDA",
        "Atendimento não está apto para registrar orçamento.",
      );
    }

    const criadoEm = new Date();
    const validoAte = addDays(criadoEm, 7);

    return prisma.$transaction(async (tx) => {
      const orcamento = await tx.orcamento.create({
        data: {
          atendimentoId,
          createdAt: criadoEm,
          valorTotal: dadosOrcamento.valorTotal,
          formaPagamento: dadosOrcamento.formaPagamento,
          dataVencimento: dadosOrcamento.dataVencimento,
          veiculosPrevistos: dadosOrcamento.veiculosPrevistos,
          observacoes: dadosOrcamento.observacoes,
          validoAte,
        },
      });

      await tx.atendimento.update({
        where: { id: atendimentoId },
        data: { status: "ORCAMENTO_REGISTRADO_AG_APROVACAO" },
      });

      return orcamento;
    });
  },

  async atualizar(
    id: string,
    input: OrcamentoUpdate | Prisma.OrcamentoUncheckedUpdateInput,
  ) {
    const orcamento = await this.buscarPorId(id);

    if (STATUS_TERMINAIS_ORCAMENTO.has(orcamento.atendimento.status)) {
      throw new InvalidTransitionError(
        "ORCAMENTO_BLOQUEADO",
        "Orçamento não pode ser atualizado no status atual do atendimento.",
      );
    }

    return orcamentoRepository.atualizar(id, input);
  },

  async cancelarManual(id: string, userId: string) {
    const orcamento = await this.buscarPorId(id);

    if (
      !podeTransicionar(orcamento.atendimento.status, "ORCAMENTO_CANCELADO")
    ) {
      throw new InvalidTransitionError(
        "TRANSICAO_INVALIDA",
        "Atendimento não pode ser cancelado nesta etapa de orçamento.",
      );
    }

    return prisma.$transaction(async (tx) => {
      await tx.atendimento.update({
        where: { id: orcamento.atendimentoId },
        data: {
          status: "ORCAMENTO_CANCELADO",
          statusAnteriorCancelamento: orcamento.atendimento.status,
          canceladoEm: new Date(),
          canceladoPor: userId,
        },
      });

      return tx.orcamento.findUnique({ where: { id } });
    });
  },

  async cancelarVencidos() {
    const vencidos = await orcamentoRepository.listarVencidosPendentes();

    if (vencidos.length === 0) {
      return { totalCancelados: 0 };
    }

    const idsAtendimentos = vencidos.map(
      (orcamento) => orcamento.atendimentoId,
    );

    await prisma.atendimento.updateMany({
      where: { id: { in: idsAtendimentos } },
      data: {
        status: "ORCAMENTO_CANCELADO",
        canceladoEm: new Date(),
      },
    });

    for (const orcamento of vencidos) {
      await prisma.atendimento.update({
        where: { id: orcamento.atendimentoId },
        data: {
          statusAnteriorCancelamento: orcamento.atendimento.status,
        },
      });
    }

    return { totalCancelados: vencidos.length };
  },

  async validarAprovacaoParaReserva(atendimentoId: string) {
    const orcamento =
      await orcamentoRepository.buscarPorAtendimentoId(atendimentoId);

    if (!orcamento) {
      throw new ValidationError(
        "ORCAMENTO_AUSENTE",
        "Atendimento precisa de orçamento antes de avançar para reserva.",
      );
    }

    if (orcamento.validoAte < new Date()) {
      throw new ValidationError(
        "ORCAMENTO_VENCIDO",
        "Orçamento vencido não pode ser convertido em reserva.",
      );
    }

    return orcamento;
  },
};
