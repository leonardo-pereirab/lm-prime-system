import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requirePerfil, requireSession } from "@/lib/auth";
import { funcionarioService } from "@/services/funcionarioService";
import { funcionarioUpdateSchema } from "@/schemas/funcionario";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  return ok(async () => {
    const session = await requireSession(request);
    requirePerfil(session, "ADMIN");

    const { id } = await params;
    return funcionarioService.buscarPorId(id);
  });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  return ok(async () => {
    const session = await requireSession(request);
    requirePerfil(session, "ADMIN");

    const { id } = await params;
    const body = await request.json();
    const input = funcionarioUpdateSchema.parse(body);
    return funcionarioService.atualizarDadosCriticos(id, input);
  });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return ok(async () => {
    const session = await requireSession(request);
    requirePerfil(session, "ADMIN");

    const { id } = await params;
    return funcionarioService.excluirOuAnonimizar(id);
  });
}
