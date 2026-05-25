import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireSession } from "@/lib/auth";
import { parseDate, parsePagination } from "@/lib/query-params";
import { contratoService } from "@/services/contratoService";

export async function GET(request: NextRequest) {
  return ok(async () => {
    await requireSession(request);
    const url = new URL(request.url);
    const { pagina, tamanho } = parsePagination(url.searchParams);

    return contratoService.listar({
      clienteId: url.searchParams.get("clienteId") ?? undefined,
      periodoInicio: parseDate(url.searchParams.get("periodoInicio")),
      periodoFim: parseDate(url.searchParams.get("periodoFim")),
      apenasAtivos: url.searchParams.get("incluirInativos") !== "true",
      pagina,
      tamanho,
    });
  });
}

export async function POST(request: NextRequest) {
  return ok(async () => {
    const session = await requireSession(request);
    const body = await request.json();
    const atendimentoId = String(body.atendimentoId ?? "");
    return contratoService.gerar(atendimentoId, session.id);
  });
}
