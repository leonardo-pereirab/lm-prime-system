import type { StatusAtendimento } from "@prisma/client";

export type StatusCor = "neutral" | "info" | "warning" | "success" | "danger";
export type EtapaAtendimento =
  | "solicitacao"
  | "orcamento"
  | "reserva"
  | "escala"
  | "contrato";
export type EtapaVisualStatus =
  | "concluida"
  | "atual"
  | "pendente"
  | "bloqueada"
  | "cancelada";

const ETAPAS_ATENDIMENTO: Array<{ id: EtapaAtendimento; label: string }> = [
  { id: "solicitacao", label: "Solicitacao" },
  { id: "orcamento", label: "Orcamento" },
  { id: "reserva", label: "Reserva" },
  { id: "escala", label: "Escala" },
  { id: "contrato", label: "Contrato" },
];

const ORDEM_CANONICA: StatusAtendimento[] = [
  "EM_SOLICITACAO",
  "AGUARDANDO_ORCAMENTO",
  "ORCAMENTO_REGISTRADO_AG_APROVACAO",
  "AGUARDANDO_RESERVA",
  "RESERVA_REGISTRADA_AG_ESCALA",
  "ESCALA_DEFINIDA",
  "SERVICO_EM_ANDAMENTO",
  "SERVICO_FINALIZADO",
];

export const TRANSICOES_VALIDAS: Record<
  StatusAtendimento,
  StatusAtendimento[]
> = {
  EM_SOLICITACAO: ["AGUARDANDO_ORCAMENTO", "ATENDIMENTO_CANCELADO"],
  AGUARDANDO_ORCAMENTO: [
    "ORCAMENTO_REGISTRADO_AG_APROVACAO",
    "ORCAMENTO_CANCELADO",
    "ATENDIMENTO_CANCELADO",
  ],
  ORCAMENTO_REGISTRADO_AG_APROVACAO: [
    "AGUARDANDO_RESERVA",
    "ORCAMENTO_CANCELADO",
    "ATENDIMENTO_CANCELADO",
  ],
  AGUARDANDO_RESERVA: [
    "RESERVA_REGISTRADA_AG_ESCALA",
    "RESERVA_CANCELADA",
    "ATENDIMENTO_CANCELADO",
  ],
  RESERVA_REGISTRADA_AG_ESCALA: [
    "ESCALA_DEFINIDA",
    "RESERVA_CANCELADA",
    "ATENDIMENTO_CANCELADO",
  ],
  ESCALA_DEFINIDA: ["SERVICO_EM_ANDAMENTO", "ATENDIMENTO_CANCELADO"],
  SERVICO_EM_ANDAMENTO: ["SERVICO_FINALIZADO"],
  SERVICO_FINALIZADO: [],
  ORCAMENTO_CANCELADO: [],
  RESERVA_CANCELADA: [],
  ATENDIMENTO_CANCELADO: [],
};

export const STATUS_LABELS: Record<StatusAtendimento, string> = {
  EM_SOLICITACAO: "Em solicitacao",
  AGUARDANDO_ORCAMENTO: "Aguardando orcamento",
  ORCAMENTO_REGISTRADO_AG_APROVACAO: "Orcamento registrado",
  AGUARDANDO_RESERVA: "Aguardando reserva",
  RESERVA_REGISTRADA_AG_ESCALA: "Reserva registrada",
  ESCALA_DEFINIDA: "Escala definida",
  SERVICO_EM_ANDAMENTO: "Servico em andamento",
  SERVICO_FINALIZADO: "Servico finalizado",
  ORCAMENTO_CANCELADO: "Orcamento cancelado",
  RESERVA_CANCELADA: "Reserva cancelada",
  ATENDIMENTO_CANCELADO: "Atendimento cancelado",
};

export const STATUS_COR: Record<StatusAtendimento, StatusCor> = {
  EM_SOLICITACAO: "neutral",
  AGUARDANDO_ORCAMENTO: "info",
  ORCAMENTO_REGISTRADO_AG_APROVACAO: "warning",
  AGUARDANDO_RESERVA: "warning",
  RESERVA_REGISTRADA_AG_ESCALA: "info",
  ESCALA_DEFINIDA: "info",
  SERVICO_EM_ANDAMENTO: "success",
  SERVICO_FINALIZADO: "success",
  ORCAMENTO_CANCELADO: "danger",
  RESERVA_CANCELADA: "danger",
  ATENDIMENTO_CANCELADO: "danger",
};

export function proximoStatus(
  atual: StatusAtendimento,
): StatusAtendimento | null {
  const indiceAtual = ORDEM_CANONICA.indexOf(atual);
  if (indiceAtual === -1 || indiceAtual === ORDEM_CANONICA.length - 1) {
    return null;
  }

  return ORDEM_CANONICA[indiceAtual + 1] ?? null;
}

export function podeTransicionar(
  de: StatusAtendimento,
  para: StatusAtendimento,
): boolean {
  return TRANSICOES_VALIDAS[de].includes(para);
}

export function statusTerminais(): StatusAtendimento[] {
  return [
    "SERVICO_FINALIZADO",
    "ORCAMENTO_CANCELADO",
    "RESERVA_CANCELADA",
    "ATENDIMENTO_CANCELADO",
  ];
}

function indiceEtapa(etapa: EtapaAtendimento) {
  return ETAPAS_ATENDIMENTO.findIndex((item) => item.id === etapa);
}

function etapaPorStatusInterno(
  status: StatusAtendimento,
  statusAnteriorCancelamento?: StatusAtendimento | null,
): EtapaAtendimento {
  if (status === "EM_SOLICITACAO") {
    return "solicitacao";
  }

  if (
    status === "AGUARDANDO_ORCAMENTO" ||
    status === "ORCAMENTO_REGISTRADO_AG_APROVACAO" ||
    status === "ORCAMENTO_CANCELADO"
  ) {
    return "orcamento";
  }

  if (status === "AGUARDANDO_RESERVA" || status === "RESERVA_CANCELADA") {
    return "reserva";
  }

  if (status === "RESERVA_REGISTRADA_AG_ESCALA") {
    return "escala";
  }

  if (
    status === "ESCALA_DEFINIDA" ||
    status === "SERVICO_EM_ANDAMENTO" ||
    status === "SERVICO_FINALIZADO"
  ) {
    return "contrato";
  }

  if (status === "ATENDIMENTO_CANCELADO" && statusAnteriorCancelamento) {
    return etapaPorStatusInterno(statusAnteriorCancelamento);
  }

  return "solicitacao";
}

function etapaCanceladaPorStatus(
  status: StatusAtendimento,
  statusAnteriorCancelamento?: StatusAtendimento | null,
): EtapaAtendimento | null {
  if (status === "ORCAMENTO_CANCELADO") {
    return "orcamento";
  }

  if (status === "RESERVA_CANCELADA") {
    return "reserva";
  }

  if (status === "ATENDIMENTO_CANCELADO") {
    return etapaPorStatusInterno(status, statusAnteriorCancelamento);
  }

  return null;
}

export function ultimaEtapaPermitida(
  status: StatusAtendimento,
  statusAnteriorCancelamento?: StatusAtendimento | null,
): EtapaAtendimento {
  return etapaPorStatusInterno(status, statusAnteriorCancelamento);
}

export function etapaPermitidaPorStatus(
  etapa: EtapaAtendimento,
  status: StatusAtendimento,
  statusAnteriorCancelamento?: StatusAtendimento | null,
): boolean {
  if (etapa === "contrato" && status === "RESERVA_REGISTRADA_AG_ESCALA") {
    return true;
  }

  const ultima = ultimaEtapaPermitida(status, statusAnteriorCancelamento);
  return indiceEtapa(etapa) <= indiceEtapa(ultima);
}

export function etapasParaStatus(
  status: StatusAtendimento,
  atendimentoId: string,
  statusAnteriorCancelamento?: StatusAtendimento | null,
): Array<{
  id: EtapaAtendimento;
  label: string;
  href: string;
  status: EtapaVisualStatus;
}> {
  const ultimaEtapa = ultimaEtapaPermitida(status, statusAnteriorCancelamento);
  const indiceAtual = indiceEtapa(ultimaEtapa);
  const etapaCancelada = etapaCanceladaPorStatus(
    status,
    statusAnteriorCancelamento,
  );
  const possuiCancelamento = etapaCancelada !== null;

  return ETAPAS_ATENDIMENTO.map((etapa, indice) => {
    let statusVisual: EtapaVisualStatus;

    if (etapaCancelada && etapa.id === etapaCancelada) {
      statusVisual = "cancelada";
    } else if (indice < indiceAtual) {
      statusVisual = "concluida";
    } else if (indice === indiceAtual && !possuiCancelamento) {
      statusVisual = "atual";
    } else if (indice === indiceAtual + 1 && !possuiCancelamento) {
      statusVisual = "pendente";
    } else {
      statusVisual = "bloqueada";
    }

    return {
      id: etapa.id,
      label: etapa.label,
      href: `/atendimentos/${atendimentoId}/${etapa.id}`,
      status: statusVisual,
    };
  });
}
