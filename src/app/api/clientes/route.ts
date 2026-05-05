import { NextResponse, type NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { clienteService } from "@/services/clienteService";

export async function GET() {
  const clientes = await clienteService.listarTodos();
  return NextResponse.json(clientes);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Prisma.ClienteUncheckedCreateInput;
  const cliente = await clienteService.criar(body);
  return NextResponse.json(cliente, { status: 201 });
}
