import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok } from "@/lib/api-response";
import { requireSession } from "@/lib/auth";
import { atendimentoService } from "@/services/atendimentoService";
import { orcamentoService } from "@/services/orcamentoService";

const avancarSchema = z.object({
  para: z.enum([
    "ORCAMENTO",
    "RESERVA",
    "ESCALA",
    "SERVICO_INICIAR",
    "SERVICO_FINALIZAR",
  ]),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  return ok(async () => {
    await requireSession(request);
    const { id } = await params;
    const body = await request.json();
    const input = avancarSchema.parse(body);

    if (input.para === "ORCAMENTO") {
      return atendimentoService.avancarParaOrcamento(id);
    }

    if (input.para === "RESERVA") {
      await orcamentoService.validarAprovacaoParaReserva(id);
      return atendimentoService.avancarParaReserva(id);
    }

    if (input.para === "ESCALA") {
      return atendimentoService.avancarParaEscala(id);
    }

    if (input.para === "SERVICO_INICIAR") {
      return atendimentoService.iniciarServico(id);
    }

    return atendimentoService.finalizarServico(id);
  });
}
