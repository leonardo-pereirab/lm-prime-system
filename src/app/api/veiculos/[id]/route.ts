import { NextResponse, type NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { veiculoService } from "@/services/veiculoService";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const veiculo = await veiculoService.buscarPorId(id);
  if (!veiculo)
    return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  return NextResponse.json(veiculo);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = (await request.json()) as Prisma.VeiculoUncheckedUpdateInput;
  const veiculo = await veiculoService.atualizar(id, body);
  return NextResponse.json(veiculo);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  await veiculoService.deletar(id);
  return new NextResponse(null, { status: 204 });
}
