import { ClassificacaoFuncionario, EstadoFuncionario } from "@prisma/client";
import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { parsePagination } from "@/lib/query-params";
import { requirePerfil, requireSession } from "@/lib/auth";
import { funcionarioService } from "@/services/funcionarioService";
import { funcionarioInputSchema } from "@/schemas/funcionario";

const ORDENACOES_VALIDAS = [
  "NOME_ASC",
  "NOME_DESC",
  "CRIADO_EM_DESC",
  "CRIADO_EM_ASC",
] as const;

type OrdenacaoValida = (typeof ORDENACOES_VALIDAS)[number];

function parseEstado(valor: string | null): EstadoFuncionario | undefined {
  if (!valor) return undefined;
  return Object.values(EstadoFuncionario).includes(valor as EstadoFuncionario)
    ? (valor as EstadoFuncionario)
    : undefined;
}

function parseClassificacao(
  valor: string | null,
): ClassificacaoFuncionario | undefined {
  if (!valor) return undefined;
  return Object.values(ClassificacaoFuncionario).includes(
    valor as ClassificacaoFuncionario,
  )
    ? (valor as ClassificacaoFuncionario)
    : undefined;
}

export async function GET(request: NextRequest) {
  return ok(async () => {
    const session = await requireSession(request);
    requirePerfil(session, "ADMIN");

    const url = new URL(request.url);
    const { pagina, tamanho } = parsePagination(url.searchParams);
    const ordenarPorRaw = url.searchParams.get("ordenarPor") ?? "NOME_ASC";
    const ordenarPor: OrdenacaoValida = ORDENACOES_VALIDAS.includes(
      ordenarPorRaw as OrdenacaoValida,
    )
      ? (ordenarPorRaw as OrdenacaoValida)
      : "NOME_ASC";

    return funcionarioService.listarPaginado(
      {
        busca: url.searchParams.get("busca") ?? undefined,
        estado: parseEstado(url.searchParams.get("estado")),
        classificacao: parseClassificacao(
          url.searchParams.get("classificacao"),
        ),
        pagina,
        tamanho,
      },
      ordenarPor,
    );
  });
}

export async function POST(request: NextRequest) {
  return ok(async () => {
    const session = await requireSession(request);
    requirePerfil(session, "ADMIN");

    const body = await request.json();
    const input = funcionarioInputSchema.parse(body);
    return funcionarioService.criarConvidado(input);
  });
}
