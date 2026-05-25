import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireSession } from "@/lib/auth";
import { usuarioService } from "@/services/usuarioService";
import { usuarioUpdateSchema } from "@/schemas/usuario";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  return ok(async () => {
    await requireSession(request);
    const { id } = await params;
    return usuarioService.buscarPorId(id);
  });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  return ok(async () => {
    await requireSession(request);
    const { id } = await params;
    const body = await request.json();
    const input = usuarioUpdateSchema.parse(body);
    return usuarioService.atualizar(id, input);
  });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return ok(async () => {
    await requireSession(request);
    const { id } = await params;
    await usuarioService.excluir(id);
    return { removido: true };
  });
}
