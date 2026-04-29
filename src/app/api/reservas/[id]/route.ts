import { NextResponse, type NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { reservaService } from "@/services/reservaService";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const reserva = await reservaService.buscarPorId(id);
  if (!reserva)
    return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  return NextResponse.json(reserva);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = (await request.json()) as Prisma.ReservaUncheckedUpdateInput;
  const reserva = await reservaService.atualizar(id, body);
  return NextResponse.json(reserva);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  await reservaService.deletar(id);
  return new NextResponse(null, { status: 204 });
}
