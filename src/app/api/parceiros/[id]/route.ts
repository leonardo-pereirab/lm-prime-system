import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireSession } from "@/lib/auth";
import { parceiroService } from "@/services/parceiroService";
import { parceiroUpdateSchema } from "@/schemas/parceiro";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  return ok(async () => {
    await requireSession(request);
    const { id } = await params;
    return parceiroService.buscarPorId(id);
  });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  return ok(async () => {
    await requireSession(request);
    const { id } = await params;
    const body = await request.json();
    const input = parceiroUpdateSchema.parse(body);
    return parceiroService.atualizar(id, input);
  });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return ok(async () => {
    await requireSession(request);
    const { id } = await params;
    await parceiroService.excluir(id);
    return { removido: true };
  });
}
