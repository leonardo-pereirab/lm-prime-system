import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireSession } from "@/lib/auth";
import { resolverDashboardPeriodo } from "@/lib/dashboard-periodo";
import { dashboardService } from "@/services/dashboardService";

export async function GET(request: NextRequest) {
  return ok(async () => {
    await requireSession(request);
    const url = new URL(request.url);
    const periodo = resolverDashboardPeriodo(url.searchParams);
    return dashboardService.obterIndicadores(periodo);
  });
}
