import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireSession } from "@/lib/auth";
import { parseBoolean, parsePagination } from "@/lib/query-params";
import { parceiroService } from "@/services/parceiroService";
import { parceiroInputSchema } from "@/schemas/parceiro";

export async function GET(request: NextRequest) {
  return ok(async () => {
    await requireSession(request);

    const url = new URL(request.url);
    const { pagina, tamanho } = parsePagination(url.searchParams);

    return parceiroService.listarPaginado({
      busca: url.searchParams.get("busca") ?? undefined,
      apenasAtivos: !parseBoolean(
        url.searchParams.get("incluirInativos"),
        false,
      ),
      ordenarPor:
        (url.searchParams.get("ordenarPor") as
          | "NOME_ASC"
          | "NOME_DESC"
          | "CRIADO_EM_DESC"
          | "CRIADO_EM_ASC"
          | null) ?? undefined,
      pagina,
      tamanho,
    });
  });
}

export async function POST(request: NextRequest) {
  return ok(async () => {
    await requireSession(request);
    const body = await request.json();
    const input = parceiroInputSchema.parse(body);
    return parceiroService.criar(input);
  });
}
