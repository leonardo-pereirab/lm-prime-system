import { NextResponse, type NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { orcamentoService } from "@/services/orcamentoService";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const orcamento = await orcamentoService.buscarPorId(id);
  if (!orcamento)
    return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  return NextResponse.json(orcamento);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = (await request.json()) as Prisma.OrcamentoUncheckedUpdateInput;
  const orcamento = await orcamentoService.atualizar(id, body);
  return NextResponse.json(orcamento);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  await orcamentoService.deletar(id);
  return new NextResponse(null, { status: 204 });
}
