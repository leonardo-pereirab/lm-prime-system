import { NextResponse, type NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { atendimentoService } from "@/services/atendimentoService";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const atendimento = await atendimentoService.buscarPorId(id);
  if (!atendimento)
    return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  return NextResponse.json(atendimento);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = (await request.json()) as Prisma.AtendimentoUncheckedUpdateInput;
  const atendimento = await atendimentoService.atualizar(id, body);
  return NextResponse.json(atendimento);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  await atendimentoService.deletar(id);
  return new NextResponse(null, { status: 204 });
}
