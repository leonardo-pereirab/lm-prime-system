import { ok } from "@/lib/api-response";
import { NotFoundError } from "@/domain/errors";
import { consultarCep } from "@/lib/cep";

type RouteParams = { params: Promise<{ cep: string }> };

export async function GET(_: Request, { params }: RouteParams) {
  return ok(async () => {
    const { cep } = await params;
    const endereco = await consultarCep(cep);

    if (!endereco) {
      throw new NotFoundError("CEP_NAO_ENCONTRADO", "CEP não encontrado.");
    }

    return endereco;
  });
}
