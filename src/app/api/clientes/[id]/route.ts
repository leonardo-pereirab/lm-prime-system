import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireSession } from "@/lib/auth";
import { clienteService } from "@/services/clienteService";
import { clienteUpdateSchema } from "@/schemas/cliente";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  return ok(async () => {
    await requireSession(request);
    const { id } = await params;
    return clienteService.buscarPorId(id);
  });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  return ok(async () => {
    await requireSession(request);
    const { id } = await params;
    const body = await request.json();
    const input = clienteUpdateSchema.parse(body);
    return clienteService.atualizar(id, input);
  });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return ok(async () => {
    await requireSession(request);
    const { id } = await params;
    return clienteService.excluir(id);
  });
}
