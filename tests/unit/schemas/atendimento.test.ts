import { TipoServico } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  atendimentoUpdateSchema,
  solicitacaoInputSchema,
  trajetoSchema,
} from "@/schemas/atendimento";

const clienteId = "clx0000000000000000000000";

const trechoValido = {
  origem: "Sao Paulo",
  destino: "Campinas",
  data: "2026-07-10",
  hora: "08:30",
};

const solicitacaoValida = {
  leadNome: "Cliente Lead",
  leadTelefone: "11987654321",
  tipoServico: TipoServico.VIAGEM,
  dataContato: "2026-06-05",
  dataServico: "2026-07-10",
  qtdPassageiros: 10,
  trajeto: [trechoValido],
};

describe("solicitacaoInputSchema", () => {
  it("aceita solicitacao com lead e aplica valores padrao", () => {
    const resultado = solicitacaoInputSchema.parse(solicitacaoValida);

    expect(resultado.leadNome).toBe("Cliente Lead");
    expect(resultado.precisaNotaFiscal).toBe(false);
    expect(resultado.dataContato).toBeInstanceOf(Date);
    expect(resultado.dataServico).toBeInstanceOf(Date);
  });

  it("aceita solicitacao com cliente existente sem dados de lead", () => {
    const resultado = solicitacaoInputSchema.safeParse({
      ...solicitacaoValida,
      clienteId,
      leadNome: undefined,
      leadTelefone: undefined,
    });

    expect(resultado.success).toBe(true);
  });

  it("rejeita solicitacao sem cliente existente e sem lead completo", () => {
    const resultado = solicitacaoInputSchema.safeParse({
      ...solicitacaoValida,
      leadNome: undefined,
    });

    expect(resultado.success).toBe(false);
  });

  it("rejeita quantidade de passageiros menor que um", () => {
    const resultado = solicitacaoInputSchema.safeParse({
      ...solicitacaoValida,
      qtdPassageiros: 0,
    });

    expect(resultado.success).toBe(false);
  });

  it("rejeita trajeto vazio", () => {
    const resultado = solicitacaoInputSchema.safeParse({
      ...solicitacaoValida,
      trajeto: [],
    });

    expect(resultado.success).toBe(false);
  });
});

describe("trajetoSchema", () => {
  it("aceita trecho valido e converte data", () => {
    const resultado = trajetoSchema.parse([trechoValido]);

    expect(resultado[0].data).toBeInstanceOf(Date);
  });

  it("rejeita horario fora do formato esperado", () => {
    const resultado = trajetoSchema.safeParse([
      {
        ...trechoValido,
        hora: "24:00",
      },
    ]);

    expect(resultado.success).toBe(false);
  });

  it("rejeita origem ou destino curtos demais", () => {
    expect(
      trajetoSchema.safeParse([{ ...trechoValido, origem: "SP" }]).success,
    ).toBe(false);
    expect(
      trajetoSchema.safeParse([{ ...trechoValido, destino: "RJ" }]).success,
    ).toBe(false);
  });
});

describe("atendimentoUpdateSchema", () => {
  it("aceita atualizacao parcial", () => {
    const resultado = atendimentoUpdateSchema.safeParse({
      observacoes: "Cliente pediu retorno no fim do dia.",
    });

    expect(resultado.success).toBe(true);
  });
});
