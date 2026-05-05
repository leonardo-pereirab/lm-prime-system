import { NextResponse, type NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { usuarioService } from "@/services/usuarioService";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const usuario = await usuarioService.buscarPorId(id);
  if (!usuario)
    return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  return NextResponse.json(usuario);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = (await request.json()) as Prisma.UsuarioUncheckedUpdateInput;
  const usuario = await usuarioService.atualizar(id, body);
  return NextResponse.json(usuario);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  await usuarioService.deletar(id);
  return new NextResponse(null, { status: 204 });
}
