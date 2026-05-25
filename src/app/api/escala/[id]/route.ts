import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireSession } from "@/lib/auth";
import { escalaService } from "@/services/escalaService";
import { escalaUpdateSchema } from "@/schemas/escala";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  return ok(async () => {
    await requireSession(request);
    const { id } = await params;
    return escalaService.buscarPorAtendimento(id);
  });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  return ok(async () => {
    await requireSession(request);
    const { id } = await params;
    const body = await request.json();
    const input = escalaUpdateSchema.parse(body);
    return escalaService.atualizar(id, {
      observacoes: input.observacoes,
      motoristaIds: input.motoristaIds ?? [],
      veiculoIds: input.veiculoIds ?? [],
      parceiros: input.parceiros ?? [],
    });
  });
}
