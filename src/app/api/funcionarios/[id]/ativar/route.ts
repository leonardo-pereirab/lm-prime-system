import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requirePerfil, requireSession } from "@/lib/auth";
import { funcionarioService } from "@/services/funcionarioService";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  return ok(async () => {
    const session = await requireSession(request);
    requirePerfil(session, "ADMIN");

    const { id } = await params;
    return funcionarioService.ativar(id);
  });
}
