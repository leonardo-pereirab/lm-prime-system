import { NextResponse, type NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { contratoService } from "@/services/contratoService";

export async function GET() {
  const contratos = await contratoService.listarTodos();
  return NextResponse.json(contratos);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Prisma.ContratoUncheckedCreateInput;
  const contrato = await contratoService.gerar(body);
  return NextResponse.json(contrato, { status: 201 });
}
