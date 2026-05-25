import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireSession } from "@/lib/auth";
import { contratoService } from "@/services/contratoService";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  return ok(async () => {
    const session = await requireSession(request);
    const { id } = await params;
    return contratoService.gerar(id, session.id);
  });
}
