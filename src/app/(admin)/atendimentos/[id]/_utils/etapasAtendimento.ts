import { redirect } from "next/navigation";

import {
  etapaPermitidaPorStatus,
  etapasParaStatus,
  type EtapaAtendimento,
} from "@/domain/status";
import { atendimentoService } from "@/services/atendimentoService";
import type { StatusAtendimento } from "@prisma/client";

export function segmentoParaEtapa(segmento?: string): EtapaAtendimento {
  if (
    segmento === "solicitacao" ||
    segmento === "orcamento" ||
    segmento === "reserva" ||
    segmento === "escala" ||
    segmento === "contrato"
  ) {
    return segmento;
  }

  return "solicitacao";
}

export function redirecionarSeEtapaBloqueada({
  atendimentoId,
  etapa,
  status,
  statusAnteriorCancelamento,
}: {
  atendimentoId: string;
  etapa: EtapaAtendimento;
  status: StatusAtendimento;
  statusAnteriorCancelamento?: StatusAtendimento | null;
}) {
  const permitida = etapaPermitidaPorStatus(
    etapa,
    status,
    statusAnteriorCancelamento,
  );

  if (permitida) {
    return;
  }

  const etapas = etapasParaStatus(
    status,
    atendimentoId,
    statusAnteriorCancelamento,
  );
  const destino =
    etapas.find((item) => item.status === "atual") ??
    etapas.find((item) => item.status === "cancelada") ??
    etapas.find((item) => item.status === "concluida") ??
    etapas[0];

  redirect(`${destino.href}?aviso=etapa-bloqueada`);
}

export async function buscarAtendimentoComGuardEtapa({
  atendimentoId,
  etapa,
}: {
  atendimentoId: string;
  etapa: EtapaAtendimento;
}) {
  const atendimento = await atendimentoService.buscarPorId(atendimentoId);

  redirecionarSeEtapaBloqueada({
    atendimentoId,
    etapa,
    status: atendimento.status,
    statusAnteriorCancelamento: atendimento.statusAnteriorCancelamento,
  });

  return atendimento;
}
