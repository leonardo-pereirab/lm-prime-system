import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireSession } from "@/lib/auth";
import { parseBoolean, parsePagination } from "@/lib/query-params";
import { usuarioService } from "@/services/usuarioService";
import { usuarioInputSchema } from "@/schemas/usuario";

export async function GET(request: NextRequest) {
  return ok(async () => {
    await requireSession(request);

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
    await requireSession(request);
    const body = await request.json();
    const input = usuarioInputSchema.parse(body);
    return usuarioService.criar(input);
  });
}
