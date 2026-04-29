import { NextResponse, type NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { motoristaService } from "@/services/motoristaService";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const motorista = await motoristaService.buscarPorId(id);
  if (!motorista)
    return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  return NextResponse.json(motorista);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = (await request.json()) as Prisma.MotoristaUncheckedUpdateInput;
  const motorista = await motoristaService.atualizar(id, body);
  return NextResponse.json(motorista);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  await motoristaService.deletar(id);
  return new NextResponse(null, { status: 204 });
}
