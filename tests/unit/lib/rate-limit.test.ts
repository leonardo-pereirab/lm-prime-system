import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { limparRateLimit, verificarRateLimit } from "@/lib/rate-limit";

describe("rate-limit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-06T12:00:00.000Z"));
    limparRateLimit();
  });

  afterEach(() => {
    limparRateLimit();
    vi.useRealTimers();
  });

  it("permite tentativas ate o limite e informa restante", () => {
    expect(
      verificarRateLimit("login:user", { limite: 2, janelaMs: 1000 }),
    ).toEqual({
      permitido: true,
      restante: 1,
      resetEmMs: 1000,
    });
    expect(
      verificarRateLimit("login:user", { limite: 2, janelaMs: 1000 }),
    ).toEqual({
      permitido: true,
      restante: 0,
      resetEmMs: 1000,
    });
  });

  it("bloqueia chamadas acima do limite dentro da janela", () => {
    verificarRateLimit("login:user", { limite: 1, janelaMs: 1000 });

    expect(
      verificarRateLimit("login:user", { limite: 1, janelaMs: 1000 }),
    ).toEqual({
      permitido: false,
      restante: 0,
      resetEmMs: 1000,
    });
  });

  it("reinicia a janela apos expiracao", () => {
    verificarRateLimit("login:user", { limite: 1, janelaMs: 1000 });
    vi.advanceTimersByTime(1000);

    expect(
      verificarRateLimit("login:user", { limite: 1, janelaMs: 1000 }),
    ).toEqual({
      permitido: true,
      restante: 0,
      resetEmMs: 1000,
    });
  });

  it("limpa registros manualmente", () => {
    verificarRateLimit("login:user", { limite: 1, janelaMs: 1000 });
    limparRateLimit();

    expect(
      verificarRateLimit("login:user", { limite: 1, janelaMs: 1000 }).permitido,
    ).toBe(true);
  });
});
