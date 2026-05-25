import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireSession } from "@/lib/auth";
import { escalaInputSchema } from "@/schemas/escala";
import { escalaService } from "@/services/escalaService";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  return ok(async () => {
    await requireSession(request);
    const { id } = await params;
    const body = await request.json();
    const input = escalaInputSchema.parse(body);
    return escalaService.definir(id, input);
  });
}
