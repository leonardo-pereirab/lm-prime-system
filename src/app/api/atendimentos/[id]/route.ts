import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireSession } from "@/lib/auth";
import { atendimentoService } from "@/services/atendimentoService";
import { atendimentoUpdateSchema } from "@/schemas/atendimento";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  return ok(async () => {
    await requireSession(request);
    const { id } = await params;
    return atendimentoService.buscarPorId(id);
  });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  return ok(async () => {
    await requireSession(request);
    const { id } = await params;
    const body = await request.json();
    const input = atendimentoUpdateSchema.parse(body);
    return atendimentoService.atualizar(id, input);
  });
}
