import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireSession } from "@/lib/auth";
import { parsePagination } from "@/lib/query-params";
import { reservaService } from "@/services/reservaService";
import { reservaInputSchema } from "@/schemas/reserva";

export async function GET(request: NextRequest) {
  return ok(async () => {
    await requireSession(request);
    const url = new URL(request.url);
    const { pagina, tamanho } = parsePagination(url.searchParams);

    return reservaService.listar({
      atendimentoId: url.searchParams.get("atendimentoId") ?? undefined,
      pagina,
      tamanho,
    });
  });
}

export async function POST(request: NextRequest) {
  return ok(async () => {
    await requireSession(request);
    const body = await request.json();
    const input = reservaInputSchema.parse(body);
    const atendimentoId = String(body.atendimentoId ?? "");
    return reservaService.criar(atendimentoId, input);
  });
}
