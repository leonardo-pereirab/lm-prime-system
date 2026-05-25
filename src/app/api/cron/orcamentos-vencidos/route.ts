import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { fail } from "@/lib/api-response";
import { UnauthorizedError } from "@/domain/errors";
import { orcamentoService } from "@/services/orcamentoService";

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization") ?? "";
    const esperado = `Bearer ${process.env.CRON_SECRET ?? ""}`;

    if (!process.env.CRON_SECRET || auth !== esperado) {
      throw new UnauthorizedError("CRON_UNAUTHORIZED", "Nao autorizado.");
    }

    const resultado = await orcamentoService.cancelarVencidos();
    return NextResponse.json({ success: true, data: resultado });
  } catch (error) {
    return fail(error);
  }
}
