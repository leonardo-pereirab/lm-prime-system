import { NextResponse, type NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { reservaService } from "@/services/reservaService";

export async function GET() {
  const reservas = await reservaService.listarTodos();
  return NextResponse.json(reservas);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Prisma.ReservaUncheckedCreateInput;
  const reserva = await reservaService.criar(body);
  return NextResponse.json(reserva, { status: 201 });
}
