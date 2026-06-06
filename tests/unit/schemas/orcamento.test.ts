import { FormaPagamento, TipoVeiculo } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  orcamentoInputSchema,
  orcamentoUpdateSchema,
  veiculoPrevistoSchema,
} from "@/schemas/orcamento";

const orcamentoValido = {
  valorTotal: 1500.5,
  formaPagamento: FormaPagamento.PIX,
  dataVencimento: "2026-06-12",
  veiculosPrevistos: [{ tipo: TipoVeiculo.VAN, quantidade: 1 }],
};

describe("orcamentoInputSchema", () => {
  it("aceita orcamento valido e converte data de vencimento", () => {
    const resultado = orcamentoInputSchema.parse(orcamentoValido);

    expect(resultado.valorTotal).toBe(1500.5);
    expect(resultado.dataVencimento).toBeInstanceOf(Date);
  });

  it("rejeita valor negativo ou com mais de duas casas decimais", () => {
    expect(
      orcamentoInputSchema.safeParse({ ...orcamentoValido, valorTotal: -1 })
        .success,
    ).toBe(false);
    expect(
      orcamentoInputSchema.safeParse({ ...orcamentoValido, valorTotal: 10.999 })
        .success,
    ).toBe(false);
  });

  it("rejeita lista vazia de veiculos previstos", () => {
    const resultado = orcamentoInputSchema.safeParse({
      ...orcamentoValido,
      veiculosPrevistos: [],
    });

    expect(resultado.success).toBe(false);
  });
});

describe("veiculoPrevistoSchema", () => {
  it("rejeita quantidade menor que um ou nao inteira", () => {
    expect(
      veiculoPrevistoSchema.safeParse({
        tipo: TipoVeiculo.VAN,
        quantidade: 0,
      }).success,
    ).toBe(false);
    expect(
      veiculoPrevistoSchema.safeParse({
        tipo: TipoVeiculo.VAN,
        quantidade: 1.5,
      }).success,
    ).toBe(false);
  });
});

describe("orcamentoUpdateSchema", () => {
  it("aceita atualizacao parcial", () => {
    expect(
      orcamentoUpdateSchema.safeParse({ observacoes: "Aprovado" }).success,
    ).toBe(true);
  });
});
