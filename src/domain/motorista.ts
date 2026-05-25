export const DIAS_ALERTA_CNH = 30;

export type StatusCnh = "VALIDA" | "VENCENDO" | "VENCIDA";

function normalizarDataUtc(data: Date | string) {
  const valor = data instanceof Date ? data : new Date(data);

  if (Number.isNaN(valor.getTime())) {
    return null;
  }

  return new Date(
    Date.UTC(valor.getUTCFullYear(), valor.getUTCMonth(), valor.getUTCDate()),
  );
}

function hojeUtc() {
  const agora = new Date();

  return new Date(
    Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate()),
  );
}

export function classificarStatusCnh(
  data: Date | string,
  diasAlerta = DIAS_ALERTA_CNH,
): StatusCnh {
  const validade = normalizarDataUtc(data);

  if (!validade) {
    return "VALIDA";
  }

  const hoje = hojeUtc();
  const dataLimite = new Date(hoje);
  dataLimite.setUTCDate(dataLimite.getUTCDate() + diasAlerta);

  if (validade < hoje) {
    return "VENCIDA";
  }

  if (validade <= dataLimite) {
    return "VENCENDO";
  }

  return "VALIDA";
}

export function cnhEstaValida(data: Date | string) {
  return classificarStatusCnh(data) !== "VENCIDA";
}
