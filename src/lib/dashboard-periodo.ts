import { parseDate } from "@/lib/query-params";

export type DashboardPresetPeriodo =
  | "7d"
  | "30d"
  | "90d"
  | "mes-atual"
  | "custom";

export type DashboardPeriodo = {
  inicio: Date;
  fim: Date;
  preset: DashboardPresetPeriodo;
};

function inicioDoDia(data: Date) {
  const valor = new Date(data);
  valor.setHours(0, 0, 0, 0);
  return valor;
}

function fimDoDia(data: Date) {
  const valor = new Date(data);
  valor.setHours(23, 59, 59, 999);
  return valor;
}

export function resolverDashboardPeriodo(
  searchParams: URLSearchParams,
): DashboardPeriodo {
  const agora = new Date();
  const presetRaw = (searchParams.get("periodo") ??
    "30d") as DashboardPresetPeriodo;

  if (presetRaw === "custom") {
    const dataInicio = parseDate(searchParams.get("dataInicio"));
    const dataFim = parseDate(searchParams.get("dataFim"));

    if (dataInicio && dataFim) {
      const inicio = inicioDoDia(dataInicio);
      const fim = fimDoDia(dataFim);

      if (inicio.getTime() <= fim.getTime()) {
        return { inicio, fim, preset: "custom" };
      }
    }
  }

  const inicio = new Date(agora);

  if (presetRaw === "7d") {
    inicio.setDate(agora.getDate() - 7);
    return { inicio, fim: agora, preset: "7d" };
  }

  if (presetRaw === "90d") {
    inicio.setDate(agora.getDate() - 90);
    return { inicio, fim: agora, preset: "90d" };
  }

  if (presetRaw === "mes-atual") {
    inicio.setDate(1);
    inicio.setHours(0, 0, 0, 0);
    return { inicio, fim: agora, preset: "mes-atual" };
  }

  inicio.setDate(agora.getDate() - 30);
  return { inicio, fim: agora, preset: "30d" };
}
