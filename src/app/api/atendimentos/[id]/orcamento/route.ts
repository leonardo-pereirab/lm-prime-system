import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireSession } from "@/lib/auth";
import { orcamentoInputSchema } from "@/schemas/orcamento";
import { orcamentoService } from "@/services/orcamentoService";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  return ok(async () => {
    await requireSession(request);
    const { id } = await params;
    const body = await request.json();
    const input = orcamentoInputSchema.parse(body);

    try {
      const existente = await orcamentoService.buscarPorAtendimento(id);
      return orcamentoService.atualizar(existente.id, input);
    } catch {
      return orcamentoService.criar(id, input);
    }
  });
}
