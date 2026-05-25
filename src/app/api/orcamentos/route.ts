import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireSession } from "@/lib/auth";
import { parseDate, parsePagination } from "@/lib/query-params";
import { orcamentoService } from "@/services/orcamentoService";
import { orcamentoInputSchema } from "@/schemas/orcamento";

export async function GET(request: NextRequest) {
  return ok(async () => {
    await requireSession(request);
    const url = new URL(request.url);
    const { pagina, tamanho } = parsePagination(url.searchParams);

    return orcamentoService.listar({
      atendimentoId: url.searchParams.get("atendimentoId") ?? undefined,
      vencidosAte: parseDate(url.searchParams.get("vencidosAte")),
      pagina,
      tamanho,
    });
  });
}

export async function POST(request: NextRequest) {
  return ok(async () => {
    await requireSession(request);
    const body = await request.json();
    const input = orcamentoInputSchema.parse(body);
    const atendimentoId = String(body.atendimentoId ?? "");
    return orcamentoService.criar(atendimentoId, input);
  });
}
