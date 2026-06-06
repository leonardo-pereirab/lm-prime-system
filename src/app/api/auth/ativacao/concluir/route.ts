import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { ativacaoConclusaoInputSchema } from "@/schemas/auth";
import { funcionarioService } from "@/services/funcionarioService";

export async function POST(request: NextRequest) {
  return ok(async () => {
    const body = await request.json();
    const input = ativacaoConclusaoInputSchema.parse(body);
    return funcionarioService.concluirPrimeiroAcesso(input);
  });
}
