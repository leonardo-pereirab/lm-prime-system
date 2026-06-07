"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ValidationError } from "@/domain/errors";
import { requireSession } from "@/lib/auth";
import { actionResult } from "@/lib/server-action";
import {
  escalaInputSchema,
  orcamentoInputSchema,
  reservaInputSchema,
  solicitacaoInputSchema,
  atendimentoUpdateSchema,
} from "@/schemas/atendimento";
import { atendimentoService } from "@/services/atendimentoService";
import { contratoService } from "@/services/contratoService";
import { escalaService } from "@/services/escalaService";
import { orcamentoService } from "@/services/orcamentoService";
import { reservaService } from "@/services/reservaService";

const avancarSchema = z.object({
  para: z.enum([
    "ORCAMENTO",
    "RESERVA",
    "ESCALA",
    "SERVICO_INICIAR",
    "SERVICO_FINALIZAR",
  ]),
});

const cancelarSchema = z.object({
  etapa: z.enum([
    "ORCAMENTO_CANCELADO",
    "RESERVA_CANCELADA",
    "ATENDIMENTO_CANCELADO",
  ]),
});

function revalidarAtendimento(id: string) {
  revalidatePath("/atendimentos");
  revalidatePath(`/atendimentos/${id}`);
  revalidatePath(`/atendimentos/${id}/solicitacao`);
  revalidatePath(`/atendimentos/${id}/orcamento`);
  revalidatePath(`/atendimentos/${id}/reserva`);
  revalidatePath(`/atendimentos/${id}/escala`);
  revalidatePath(`/atendimentos/${id}/contrato`);
}

function serializarOrcamentoParaClient(orcamento: {
  id: string;
  atendimentoId: string;
  formaPagamento: string;
  dataVencimento: Date | null;
  validoAte: Date;
  observacoes: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: orcamento.id,
    atendimentoId: orcamento.atendimentoId,
    formaPagamento: orcamento.formaPagamento,
    dataVencimento: orcamento.dataVencimento,
    validoAte: orcamento.validoAte,
    observacoes: orcamento.observacoes,
    createdAt: orcamento.createdAt,
    updatedAt: orcamento.updatedAt,
  };
}

export async function criarAtendimento(payload: unknown) {
  return actionResult(async () => {
    const session = await requireSession();
    const input = solicitacaoInputSchema.parse(payload);
    const atendimento = await atendimentoService.criar(input, session.id);
    revalidatePath("/atendimentos");
    return atendimento;
  });
}

export async function atualizarSolicitacao(id: string, payload: unknown) {
  return actionResult(async () => {
    await requireSession();
    const input = atendimentoUpdateSchema.parse(payload);
    const atendimento = await atendimentoService.atualizarSolicitacao(
      id,
      input,
    );
    revalidarAtendimento(id);
    return atendimento;
  });
}

export async function salvarSolicitacao(id: string, payload: unknown) {
  return atualizarSolicitacao(id, payload);
}

export async function cancelarAtendimentoSemSalvar(id?: string) {
  return actionResult(async () => {
    await requireSession();

    if (id) {
      throw new ValidationError(
        "CANCELAMENTO_SEM_SALVAR_INVALIDO",
        "Cancelar e sair so pode ser usado antes do primeiro salvamento.",
      );
    }

    revalidatePath("/atendimentos");
    return { cancelado: true };
  });
}

export async function salvarOrcamento(id: string, payload: unknown) {
  return actionResult(async () => {
    await requireSession();
    const input = orcamentoInputSchema.parse(payload);

    try {
      const existente = await orcamentoService.buscarPorAtendimento(id);
      const orcamento = await orcamentoService.atualizar(existente.id, input);
      revalidarAtendimento(id);
      return serializarOrcamentoParaClient(orcamento);
    } catch {
      const orcamento = await orcamentoService.criar(id, input);
      revalidarAtendimento(id);
      return serializarOrcamentoParaClient(orcamento);
    }
  });
}

export async function cancelarOrcamento(atendimentoId: string) {
  return actionResult(async () => {
    const session = await requireSession();
    const orcamento =
      await orcamentoService.buscarPorAtendimento(atendimentoId);
    const resultado = await orcamentoService.cancelarManual(
      orcamento.id,
      session.id,
    );
    revalidarAtendimento(atendimentoId);
    return resultado ? { id: resultado.id } : { id: null };
  });
}

export async function avancarParaReserva(atendimentoId: string) {
  return actionResult(async () => {
    await requireSession();
    await orcamentoService.validarAprovacaoParaReserva(atendimentoId);
    const atendimento =
      await atendimentoService.avancarParaReserva(atendimentoId);
    revalidarAtendimento(atendimentoId);
    return atendimento;
  });
}

export async function salvarReserva(id: string, payload: unknown) {
  return actionResult(async () => {
    await requireSession();
    const input = reservaInputSchema.parse(payload);

    try {
      const existente = await reservaService.buscarPorAtendimento(id);
      const reserva = await reservaService.atualizar(existente.id, input);
      revalidarAtendimento(id);
      return reserva;
    } catch {
      const reserva = await reservaService.criar(id, input);
      revalidarAtendimento(id);
      return reserva;
    }
  });
}

export async function cancelarReserva(atendimentoId: string) {
  return actionResult(async () => {
    const session = await requireSession();
    const reserva = await reservaService.buscarPorAtendimento(atendimentoId);
    const resultado = await reservaService.cancelar(reserva.id, session.id);
    revalidarAtendimento(atendimentoId);
    return { id: resultado.id };
  });
}

export async function salvarEscala(id: string, payload: unknown) {
  return actionResult(async () => {
    await requireSession();
    const input = escalaInputSchema.parse(payload);
    const escala = await escalaService.atualizar(id, input);
    revalidarAtendimento(id);

    if (!escala?.id) {
      throw new ValidationError(
        "ESCALA_NAO_PERSISTIDA",
        "Não foi possível persistir a escala.",
      );
    }

    return { id: escala.id };
  });
}

export async function gerarContrato(id: string) {
  return actionResult(async () => {
    const session = await requireSession();
    const contrato = await contratoService.gerar(id, session.id);
    revalidarAtendimento(id);
    revalidatePath("/contratos");
    return contrato;
  });
}

export async function avancarEtapa(id: string, payload: unknown) {
  return actionResult(async () => {
    await requireSession();
    const input = avancarSchema.parse(payload);

    if (input.para === "ORCAMENTO") {
      const atendimento = await atendimentoService.avancarParaOrcamento(id);
      revalidarAtendimento(id);
      return atendimento;
    }

    if (input.para === "RESERVA") {
      await orcamentoService.validarAprovacaoParaReserva(id);
      const atendimento = await atendimentoService.avancarParaReserva(id);
      revalidarAtendimento(id);
      return atendimento;
    }

    if (input.para === "ESCALA") {
      const atendimento = await atendimentoService.avancarParaEscala(id);
      revalidarAtendimento(id);
      return atendimento;
    }

    if (input.para === "SERVICO_INICIAR") {
      const atendimento = await atendimentoService.iniciarServico(id);
      revalidarAtendimento(id);
      return atendimento;
    }

    const atendimento = await atendimentoService.finalizarServico(id);
    revalidarAtendimento(id);
    return atendimento;
  });
}

export async function cancelarAtendimento(id: string, payload: unknown) {
  return actionResult(async () => {
    const session = await requireSession();
    const input = cancelarSchema.parse(payload);
    const atendimento = await atendimentoService.cancelar(
      id,
      input.etapa,
      session.id,
    );
    revalidarAtendimento(id);
    return atendimento;
  });
}
