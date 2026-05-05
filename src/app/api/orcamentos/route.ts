import { NextResponse, type NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { orcamentoService } from "@/services/orcamentoService";

export async function GET() {
  const orcamentos = await orcamentoService.listarTodos();
  return NextResponse.json(orcamentos);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Prisma.OrcamentoUncheckedCreateInput;
  const orcamento = await orcamentoService.criar(body);
  return NextResponse.json(orcamento, { status: 201 });
}
