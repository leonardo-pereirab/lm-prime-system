type RateLimitOptions = {
  limite?: number;
  janelaMs?: number;
};

type RegistroRateLimit = {
  tentativas: number;
  expiraEm: number;
};

const store = new Map<string, RegistroRateLimit>();

export function verificarRateLimit(
  chave: string,
  options: RateLimitOptions = {},
): { permitido: boolean; restante: number; resetEmMs: number } {
  const limite = options.limite ?? 10;
  const janelaMs = options.janelaMs ?? 60_000;
  const agora = Date.now();

  const registroAtual = store.get(chave);

  if (!registroAtual || registroAtual.expiraEm <= agora) {
    const novoRegistro: RegistroRateLimit = {
      tentativas: 1,
      expiraEm: agora + janelaMs,
    };

    store.set(chave, novoRegistro);

    return {
      permitido: true,
      restante: Math.max(limite - novoRegistro.tentativas, 0),
      resetEmMs: janelaMs,
    };
  }

  registroAtual.tentativas += 1;
  store.set(chave, registroAtual);

  const permitido = registroAtual.tentativas <= limite;

  return {
    permitido,
    restante: Math.max(limite - registroAtual.tentativas, 0),
    resetEmMs: Math.max(registroAtual.expiraEm - agora, 0),
  };
}

export function limparRateLimit(): void {
  store.clear();
}
