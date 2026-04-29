import { NextResponse, type NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { escalaService } from "@/services/escalaService";

export async function GET() {
  const escalas = await escalaService.listarTodas();
  return NextResponse.json(escalas);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Prisma.EscalaUncheckedCreateInput;
  const escala = await escalaService.atribuir(body);
  return NextResponse.json(escala, { status: 201 });
}
