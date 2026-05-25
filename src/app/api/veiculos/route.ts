import type { NextRequest } from "next/server";
import { TipoVeiculo } from "@prisma/client";
import { ok } from "@/lib/api-response";
import { requireSession } from "@/lib/auth";
import { parseBoolean, parsePagination } from "@/lib/query-params";
import { veiculoService } from "@/services/veiculoService";
import { veiculoInputSchema } from "@/schemas/veiculo";

export async function GET(request: NextRequest) {
  return ok(async () => {
    await requireSession(request);

    const url = new URL(request.url);
    const { pagina, tamanho } = parsePagination(url.searchParams);
    const tipo = url.searchParams.get("tipo");
    const ordenarPor = url.searchParams.get("ordenarPor") ?? undefined;

    return veiculoService.listarPaginado({
      busca: url.searchParams.get("busca") ?? undefined,
      tipo:
        tipo && Object.values(TipoVeiculo).includes(tipo as TipoVeiculo)
          ? (tipo as TipoVeiculo)
          : undefined,
      apenasAtivos: !parseBoolean(
        url.searchParams.get("incluirInativos"),
        false,
      ),
      ordenarPor: ordenarPor as
        | "MODELO_ASC"
        | "MODELO_DESC"
        | "PLACA_ASC"
        | "PLACA_DESC"
        | "CAPACIDADE_ASC"
        | "CAPACIDADE_DESC"
        | "CRIADO_EM_DESC"
        | "CRIADO_EM_ASC"
        | undefined,
      pagina,
      tamanho,
    });
  });
}

export async function POST(request: NextRequest) {
  return ok(async () => {
    await requireSession(request);
    const body = await request.json();
    const input = veiculoInputSchema.parse(body);
    return veiculoService.criar(input);
  });
}
