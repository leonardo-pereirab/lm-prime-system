import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok } from "@/lib/api-response";
import { requireSession } from "@/lib/auth";
import { atendimentoService } from "@/services/atendimentoService";

const cancelarSchema = z.object({
  etapa: z.enum([
    "ORCAMENTO_CANCELADO",
    "RESERVA_CANCELADA",
    "ATENDIMENTO_CANCELADO",
  ]),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  return ok(async () => {
    const session = await requireSession(request);
    const { id } = await params;
    const body = await request.json();
    const input = cancelarSchema.parse(body);
    return atendimentoService.cancelar(id, input.etapa, session.id);
  });
}
