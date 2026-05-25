import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireSession } from "@/lib/auth";
import { parsePagination } from "@/lib/query-params";
import { escalaService } from "@/services/escalaService";
import { escalaInputSchema } from "@/schemas/escala";

export async function GET(request: NextRequest) {
  return ok(async () => {
    await requireSession(request);
    const url = new URL(request.url);
    const { pagina, tamanho } = parsePagination(url.searchParams);

    return escalaService.listar({
      atendimentoId: url.searchParams.get("atendimentoId") ?? undefined,
      motoristaId: url.searchParams.get("motoristaId") ?? undefined,
      veiculoId: url.searchParams.get("veiculoId") ?? undefined,
      parceiroId: url.searchParams.get("parceiroId") ?? undefined,
      pagina,
      tamanho,
    });
  });
}

export async function POST(request: NextRequest) {
  return ok(async () => {
    await requireSession(request);
    const body = await request.json();
    const atendimentoId = String(body.atendimentoId ?? "");
    const input = escalaInputSchema.parse(body);
    return escalaService.definir(atendimentoId, input);
  });
}
