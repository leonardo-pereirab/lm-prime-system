import { describe, expect, it } from "vitest";

import { parseBoolean, parseDate, parsePagination } from "@/lib/query-params";

describe("parsePagination", () => {
  it("usa pagina e tamanho informados quando validos", () => {
    const params = new URLSearchParams({ pagina: "3", tamanho: "50" });

    expect(parsePagination(params)).toEqual({ pagina: 3, tamanho: 50 });
  });

  it("usa valores padrao quando parametros estao ausentes ou invalidos", () => {
    expect(parsePagination(new URLSearchParams())).toEqual({
      pagina: 1,
      tamanho: 20,
    });
    expect(
      parsePagination(new URLSearchParams({ pagina: "0", tamanho: "101" })),
    ).toEqual({ pagina: 1, tamanho: 20 });
    expect(
      parsePagination(new URLSearchParams({ pagina: "abc", tamanho: "-1" })),
    ).toEqual({ pagina: 1, tamanho: 20 });
  });
});

describe("parseBoolean", () => {
  it("reconhece valores verdadeiros conhecidos", () => {
    expect(parseBoolean("1", false)).toBe(true);
    expect(parseBoolean("true", false)).toBe(true);
    expect(parseBoolean("sim", false)).toBe(true);
    expect(parseBoolean("yes", false)).toBe(true);
  });

  it("retorna default para null e false para outros valores", () => {
    expect(parseBoolean(null, true)).toBe(true);
    expect(parseBoolean("false", true)).toBe(false);
    expect(parseBoolean("nao", true)).toBe(false);
  });
});

describe("parseDate", () => {
  it("converte data valida", () => {
    expect(parseDate("2026-06-05")).toBeInstanceOf(Date);
  });

  it("retorna undefined para valor ausente ou invalido", () => {
    expect(parseDate(null)).toBeUndefined();
    expect(parseDate("")).toBeUndefined();
    expect(parseDate("data invalida")).toBeUndefined();
  });
});
