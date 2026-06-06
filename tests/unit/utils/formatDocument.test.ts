import { describe, expect, it } from "vitest";

import { formatCNPJ, formatCPF, formatDocument } from "@/utils/formatDocument";

describe("formatCPF", () => {
  it("formata cpf com onze digitos", () => {
    expect(formatCPF("52998224725")).toBe("529.982.247-25");
  });

  it("retorna o valor original quando nao encontra o padrao completo", () => {
    expect(formatCPF("123")).toBe("123");
  });
});

describe("formatCNPJ", () => {
  it("formata cnpj com quatorze digitos", () => {
    expect(formatCNPJ("11222333000181")).toBe("11.222.333/0001-81");
  });

  it("retorna o valor original quando nao encontra o padrao completo", () => {
    expect(formatCNPJ("123")).toBe("123");
  });
});

describe("formatDocument", () => {
  it("remove caracteres nao numericos antes de formatar cpf", () => {
    expect(formatDocument("529.982.247-25")).toBe("529.982.247-25");
  });

  it("remove caracteres nao numericos antes de formatar cnpj", () => {
    expect(formatDocument("11.222.333/0001-81")).toBe("11.222.333/0001-81");
  });

  it("usa formato de cpf para documentos com ate onze digitos", () => {
    expect(formatDocument("123")).toBe("123");
  });
});
