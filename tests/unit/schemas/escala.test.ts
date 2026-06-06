import { TipoVeiculo } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  escalaInputSchema,
  escalaParceiroSchema,
  escalaUpdateSchema,
} from "@/schemas/escala";

const motoristaId = "clx0000000000000000000000";
const veiculoId = "clx0000000000000000000001";
const parceiroId = "clx0000000000000000000002";

const parceiroValido = {
  parceiroId,
  qtdVeiculos: 1,
  tipoVeiculo: TipoVeiculo.ONIBUS,
  valorRepasse: 900,
};

describe("escalaInputSchema", () => {
  it("aceita escala com motorista e veiculo", () => {
    const resultado = escalaInputSchema.parse({
      motoristaIds: [motoristaId],
      veiculoIds: [veiculoId],
    });

    expect(resultado.motoristaIds).toEqual([motoristaId]);
    expect(resultado.veiculoIds).toEqual([veiculoId]);
    expect(resultado.parceiros).toEqual([]);
  });

  it("aceita escala com parceiro mesmo sem motorista", () => {
    const resultado = escalaInputSchema.safeParse({
      parceiros: [parceiroValido],
    });

    expect(resultado.success).toBe(true);
  });

  it("rejeita escala sem motorista e sem parceiro", () => {
    const resultado = escalaInputSchema.safeParse({
      veiculoIds: [veiculoId],
    });

    expect(resultado.success).toBe(false);
  });
});

describe("escalaParceiroSchema", () => {
  it("aceita parceiro valido", () => {
    expect(escalaParceiroSchema.safeParse(parceiroValido).success).toBe(true);
  });

  it("rejeita id invalido, quantidade invalida ou valor negativo", () => {
    expect(
      escalaParceiroSchema.safeParse({
        ...parceiroValido,
        parceiroId: "id-invalido",
      }).success,
    ).toBe(false);
    expect(
      escalaParceiroSchema.safeParse({ ...parceiroValido, qtdVeiculos: 0 })
        .success,
    ).toBe(false);
    expect(
      escalaParceiroSchema.safeParse({ ...parceiroValido, valorRepasse: -1 })
        .success,
    ).toBe(false);
  });
});

describe("escalaUpdateSchema", () => {
  it("aceita atualizacao parcial", () => {
    expect(
      escalaUpdateSchema.safeParse({ observacoes: "Alterada" }).success,
    ).toBe(true);
  });
});
