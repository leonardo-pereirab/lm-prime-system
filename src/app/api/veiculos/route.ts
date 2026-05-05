import { NextResponse, type NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";

export async function GET() {
  return NextResponse.json([]);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Prisma.VeiculoUncheckedCreateInput;
  return NextResponse.json(body, { status: 201 });
}
