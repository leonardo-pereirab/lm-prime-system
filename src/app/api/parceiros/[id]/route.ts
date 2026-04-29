import { NextResponse, type NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { parceiroService } from "@/services/parceiroService";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const parceiro = await parceiroService.buscarPorId(id);
  if (!parceiro)
    return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  return NextResponse.json(parceiro);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = (await request.json()) as Prisma.ParceiroUncheckedUpdateInput;
  const parceiro = await parceiroService.atualizar(id, body);
  return NextResponse.json(parceiro);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  await parceiroService.deletar(id);
  return new NextResponse(null, { status: 204 });
}
