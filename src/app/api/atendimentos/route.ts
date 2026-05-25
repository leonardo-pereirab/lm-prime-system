import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireSession } from "@/lib/auth";
import { parseDate, parsePagination } from "@/lib/query-params";
import { STATUS_LABELS } from "@/domain/status";
import { atendimentoService } from "@/services/atendimentoService";
import { solicitacaoInputSchema } from "@/schemas/atendimento";
import type { StatusAtendimento } from "@prisma/client";

const STATUS_VALIDOS = Object.keys(STATUS_LABELS) as StatusAtendimento[];

function ajustarFimDoDia(data?: Date) {
  if (!data) {
    return undefined;
  }

  const ajustada = new Date(data);
  ajustada.setHours(23, 59, 59, 999);

  return ajustada;
}

export async function GET(request: NextRequest) {
  return ok(async () => {
    await requireSession(request);
    const url = new URL(request.url);
    const { pagina, tamanho } = parsePagination(url.searchParams);
    const statusRaw = url.searchParams.get("status");
    const status =
      statusRaw && STATUS_VALIDOS.includes(statusRaw as StatusAtendimento)
        ? (statusRaw as StatusAtendimento)
        : undefined;

    return atendimentoService.listar({
      busca: url.searchParams.get("busca") ?? undefined,
      status,
      clienteId: url.searchParams.get("clienteId") ?? undefined,
      dataServicoDe: parseDate(url.searchParams.get("dataInicio")),
      dataServicoAte: ajustarFimDoDia(
        parseDate(url.searchParams.get("dataFim")),
      ),
      pagina,
      tamanho,
    });
  });
}

export async function POST(request: NextRequest) {
  return ok(async () => {
    const session = await requireSession(request);
    const body = await request.json();
    const input = solicitacaoInputSchema.parse(body);
    return atendimentoService.criar(input, session.id);
  });
}
