import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireSession } from "@/lib/auth";
import { reservaService } from "@/services/reservaService";
import { reservaUpdateSchema } from "@/schemas/reserva";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  return ok(async () => {
    await requireSession(request);
    const { id } = await params;
    return reservaService.buscarPorId(id);
  });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  return ok(async () => {
    await requireSession(request);
    const { id } = await params;
    const body = await request.json();
    const input = reservaUpdateSchema.parse(body);
    return reservaService.atualizar(id, input);
  });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return ok(async () => {
    const session = await requireSession(request);
    const { id } = await params;
    await reservaService.cancelar(id, session.id);
    return { removido: true };
  });
}
