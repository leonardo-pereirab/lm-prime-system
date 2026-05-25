import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireSession } from "@/lib/auth";
import { reservaInputSchema } from "@/schemas/reserva";
import { reservaService } from "@/services/reservaService";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  return ok(async () => {
    await requireSession(request);
    const { id } = await params;
    const body = await request.json();
    const input = reservaInputSchema.parse(body);

    try {
      const existente = await reservaService.buscarPorAtendimento(id);
      return reservaService.atualizar(existente.id, input);
    } catch {
      return reservaService.criar(id, input);
    }
  });
}
