import { NextResponse, type NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { atendimentoService } from "@/services/atendimentoService";

export async function GET() {
  const atendimentos = await atendimentoService.listarTodos();
  return NextResponse.json(atendimentos);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Prisma.AtendimentoUncheckedCreateInput;
  const atendimento = await atendimentoService.criar(body);
  return NextResponse.json(atendimento, { status: 201 });
}
