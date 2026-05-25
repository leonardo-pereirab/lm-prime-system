import { describe, expect, it } from "vitest";
import {
  formatarCpfCnpj,
  formatarData,
  formatarDataHora,
  formatarMoeda,
  formatarTelefoneBr,
} from "@/lib/format";

describe("lib/format", () => {
  it("deve formatar moeda em pt-BR", () => {
    expect(formatarMoeda(1234.56)).toBe("R$ 1.234,56");
  });

  it("deve formatar data em DD/MM/AAAA", () => {
    expect(formatarData(new Date("2026-05-04T00:00:00.000Z"))).toBe(
      "04/05/2026",
    );
  });

  it("deve formatar data e hora", () => {
    expect(formatarDataHora(new Date("2026-05-04T15:20:00.000Z"))).toContain(
      "04/05/2026",
    );
  });

  it("deve formatar telefone brasileiro", () => {
    expect(formatarTelefoneBr("11987654321")).toBe("(11) 98765-4321");
  });

  it("deve formatar cpf/cnpj", () => {
    expect(formatarCpfCnpj("11144477735")).toBe("111.444.777-35");
  });
});
