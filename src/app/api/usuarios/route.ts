import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { ConflictError } from "@/domain/errors";
import { requirePerfil, requireSession } from "@/lib/auth";
import { parseBoolean, parsePagination } from "@/lib/query-params";
import { usuarioService } from "@/services/usuarioService";

export async function GET(request: NextRequest) {
  return ok(async () => {
    const session = await requireSession(request);
    requirePerfil(session, "ADMIN");

    const url = new URL(request.url);
    const { pagina, tamanho } = parsePagination(url.searchParams);

    return usuarioService.listar({
      busca: url.searchParams.get("busca") ?? undefined,
      apenasAtivos: !parseBoolean(
        url.searchParams.get("incluirInativos"),
        false,
      ),
      pagina,
      tamanho,
    });
  });
}

export async function POST(request: NextRequest) {
  return ok(async () => {
    const session = await requireSession(request);
    requirePerfil(session, "ADMIN");

    throw new ConflictError(
      "CRIACAO_DIRETA_BLOQUEADA",
      "Criacao direta de usuario bloqueada. Use o fluxo de ativacao de funcionario.",
    );
  });
}
