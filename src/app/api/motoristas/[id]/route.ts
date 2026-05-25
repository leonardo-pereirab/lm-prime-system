import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireSession } from "@/lib/auth";
import { motoristaService } from "@/services/motoristaService";
import { motoristaUpdateSchema } from "@/schemas/motorista";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  return ok(async () => {
    await requireSession(request);
    const { id } = await params;
    return motoristaService.buscarPorId(id);
  });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  return ok(async () => {
    await requireSession(request);
    const { id } = await params;
    const body = await request.json();
    const input = motoristaUpdateSchema.parse(body);
    return motoristaService.atualizar(id, input);
  });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return ok(async () => {
    await requireSession(request);
    const { id } = await params;
    await motoristaService.excluir(id);
    return { removido: true };
  });
}
