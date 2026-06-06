import { describe, expect, it } from "vitest";

import { formatCurrency } from "@/utils/formatCurrency";

describe("formatCurrency", () => {
  it("formata numero como moeda brasileira", () => {
    expect(formatCurrency(1234.5)).toBe("R$\u00A01.234,50");
    expect(formatCurrency(0)).toBe("R$\u00A00,00");
  });

  it("preserva sinal de valores negativos", () => {
    expect(formatCurrency(-10)).toBe("-R$\u00A010,00");
  });
});
