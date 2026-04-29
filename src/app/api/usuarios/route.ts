import { NextResponse, type NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { usuarioService } from "@/services/usuarioService";

export async function GET() {
  const usuarios = await usuarioService.listarTodos();
  return NextResponse.json(usuarios);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Prisma.UsuarioUncheckedCreateInput;
  const usuario = await usuarioService.criar(body);
  return NextResponse.json(usuario, { status: 201 });
}
