import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { parseBoolean, parsePagination } from "@/lib/query-params";
import { requireSession } from "@/lib/auth";
import { clienteService } from "@/services/clienteService";
import { clienteInputSchema } from "@/schemas/cliente";

const ORDENACOES_VALIDAS = [
  "NOME_ASC",
  "NOME_DESC",
  "CRIADO_EM_DESC",
  "CRIADO_EM_ASC",
] as const;

type OrdenacaoValida = (typeof ORDENACOES_VALIDAS)[number];

export async function GET(request: NextRequest) {
  return ok(async () => {
    await requireSession(request);

    const url = new URL(request.url);
    const { pagina, tamanho } = parsePagination(url.searchParams);
    const ordenarPorRaw = url.searchParams.get("ordenarPor") ?? "NOME_ASC";
    const ordenarPor: OrdenacaoValida = ORDENACOES_VALIDAS.includes(
      ordenarPorRaw as OrdenacaoValida,
    )
      ? (ordenarPorRaw as OrdenacaoValida)
      : "NOME_ASC";

    return clienteService.listarPaginado({
      busca: url.searchParams.get("busca") ?? undefined,
      apenasAtivos: !parseBoolean(
        url.searchParams.get("incluirInativos"),
        false,
      ),
      ordenarPor,
      pagina,
      tamanho,
    });
  });
}

export async function POST(request: NextRequest) {
  return ok(async () => {
    await requireSession(request);
    const body = await request.json();
    const input = clienteInputSchema.parse(body);
    return clienteService.criar(input);
  });
}
