import { NextResponse, type NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { escalaService } from "@/services/escalaService";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const escala = await escalaService.buscarPorAtendimento(id);
  if (!escala)
    return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  return NextResponse.json(escala);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = (await request.json()) as Prisma.EscalaUncheckedUpdateInput;
  const escala = await escalaService.atualizar(id, body);
  return NextResponse.json(escala);
}
