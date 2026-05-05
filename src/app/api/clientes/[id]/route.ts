import { NextResponse, type NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { clienteService } from "@/services/clienteService";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const cliente = await clienteService.buscarPorId(id);
  if (!cliente)
    return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  return NextResponse.json(cliente);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = (await request.json()) as Prisma.ClienteUncheckedUpdateInput;
  const cliente = await clienteService.atualizar(id, body);
  return NextResponse.json(cliente);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  await clienteService.deletar(id);
  return new NextResponse(null, { status: 204 });
}
