export type Envelope<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

export async function requestJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const resposta = await fetch(input, init);
  const json = (await resposta.json()) as Envelope<T>;

  if (!resposta.ok || !json.success) {
    const mensagem =
      !json.success && json.error.message
        ? json.error.message
        : "Erro ao processar requisicao.";
    throw new Error(mensagem);
  }

  return json.data;
}

export function buildQS(params: Record<string, unknown>) {
  const searchParams = new URLSearchParams();

  for (const [chave, valor] of Object.entries(params)) {
    if (valor === undefined || valor === null || valor === "") {
      continue;
    }

    if (Array.isArray(valor)) {
      for (const item of valor) {
        searchParams.append(chave, String(item));
      }
      continue;
    }

    searchParams.set(chave, String(valor));
  }

  return searchParams.toString();
}
