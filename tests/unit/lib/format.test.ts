import { describe, expect, it } from "vitest";

import {
  formatarCpfCnpj,
  formatarData,
  formatarDataHora,
  formatarMoeda,
  formatarTelefoneBr,
} from "@/lib/format";

describe("format helpers", () => {
  it("formata valores monetarios em reais", () => {
    expect(formatarMoeda(1234.5)).toBe("R$ 1.234,50");
    expect(formatarMoeda({ toNumber: () => 10 })).toBe("R$ 10,00");
  });

  it("formata datas em pt-BR usando UTC para data simples", () => {
    expect(formatarData(new Date("2026-06-05T23:00:00.000Z"))).toBe(
      "05/06/2026",
    );
    expect(formatarData("data invalida")).toBe("");
  });

  it("formata data e hora quando a data e valida", () => {
    expect(formatarDataHora(new Date("2026-06-05T12:30:00.000Z"))).toContain(
      "05/06/2026",
    );
    expect(formatarDataHora("data invalida")).toBe("");
  });

  it("delega formatacao de telefone e documento ao dominio", () => {
    expect(formatarTelefoneBr("11987654321")).toBe("(11) 98765-4321");
    expect(formatarCpfCnpj("52998224725")).toBe("529.982.247-25");
  });
});
