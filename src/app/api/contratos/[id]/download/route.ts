import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { fail } from "@/lib/api-response";
import { requireSession } from "@/lib/auth";
import { contratoService } from "@/services/contratoService";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireSession(request);
    const { id } = await params;
    const arquivo = await contratoService.obterArquivoDownload(id);
    const disposition =
      request.nextUrl.searchParams.get("disposition") === "inline"
        ? "inline"
        : "attachment";

    return new NextResponse(arquivo.stream, {
      headers: {
        "Content-Type": arquivo.contentType,
        "Content-Disposition": `${disposition}; filename="${arquivo.nomeArquivo}"`,
        ETag: arquivo.etag,
        "Cache-Control": "private, no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return fail(error);
  }
}
