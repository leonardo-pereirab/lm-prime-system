import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireSession } from "@/lib/auth";
import {
  dashboardService,
  type DashboardPeriodo,
} from "@/services/dashboardService";

function resolverPeriodo(valor: string | null): DashboardPeriodo {
  const agora = new Date();
  const inicio = new Date(agora);

  if (valor === "7d") {
    inicio.setDate(agora.getDate() - 7);
  } else if (valor === "90d") {
    inicio.setDate(agora.getDate() - 90);
  } else if (valor === "mes-atual") {
    inicio.setDate(1);
    inicio.setHours(0, 0, 0, 0);
  } else {
    inicio.setDate(agora.getDate() - 30);
  }

  return { inicio, fim: agora };
}

export async function GET(request: NextRequest) {
  return ok(async () => {
    await requireSession(request);
    const url = new URL(request.url);
    const periodo = resolverPeriodo(url.searchParams.get("periodo"));
    return dashboardService.obterIndicadores(periodo);
  });
}
