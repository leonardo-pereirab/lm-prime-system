import { NextResponse, type NextRequest } from "next/server";
import { contratoService } from "@/services/contratoService";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const contrato = await contratoService.buscarPorAtendimento(id);
  if (!contrato)
    return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  return NextResponse.json(contrato);
}
