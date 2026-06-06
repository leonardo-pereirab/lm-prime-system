import { ClassificacaoFuncionario, EstadoFuncionario } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  funcionarioEstadoSchema,
  funcionarioInputSchema,
  funcionarioUpdateSchema,
} from "@/schemas/funcionario";

const funcionarioValido = {
  nomeCompleto: "Ana Atendente",
  emailCorporativo: "ana@lmprime.com",
  cpf: "52998224725",
  telefonePrincipal: "11987654321",
  cep: "12345678",
  logradouro: "Rua Central",
  numero: "100",
  bairro: "Centro",
  cidade: "Sao Paulo",
  estadoUf: "SP",
};

describe("funcionarioInputSchema", () => {
  it("aceita funcionario valido e aplica classificacao padrao", () => {
    const resultado = funcionarioInputSchema.parse(funcionarioValido);

    expect(resultado.classificacao).toBe(ClassificacaoFuncionario.ATENDENTE);
  });

  it("aceita classificacao informada", () => {
    const resultado = funcionarioInputSchema.parse({
      ...funcionarioValido,
      classificacao: ClassificacaoFuncionario.GERENTE,
    });

    expect(resultado.classificacao).toBe(ClassificacaoFuncionario.GERENTE);
  });

  it("rejeita dados de contato e documentos invalidos", () => {
    expect(
      funcionarioInputSchema.safeParse({
        ...funcionarioValido,
        emailCorporativo: "email",
      }).success,
    ).toBe(false);
    expect(
      funcionarioInputSchema.safeParse({ ...funcionarioValido, cpf: "123" })
        .success,
    ).toBe(false);
    expect(
      funcionarioInputSchema.safeParse({
        ...funcionarioValido,
        telefonePrincipal: "123",
      }).success,
    ).toBe(false);
  });

  it("rejeita endereco obrigatorio incompleto", () => {
    expect(
      funcionarioInputSchema.safeParse({ ...funcionarioValido, logradouro: "" })
        .success,
    ).toBe(false);
    expect(
      funcionarioInputSchema.safeParse({ ...funcionarioValido, estadoUf: "S" })
        .success,
    ).toBe(false);
  });
});

describe("funcionarioUpdateSchema", () => {
  it("aceita atualizacao parcial", () => {
    expect(
      funcionarioUpdateSchema.safeParse({ cidade: "Campinas" }).success,
    ).toBe(true);
  });
});

describe("funcionarioEstadoSchema", () => {
  it("aceita estado de funcionario valido", () => {
    expect(
      funcionarioEstadoSchema.safeParse({ estado: EstadoFuncionario.ATIVO })
        .success,
    ).toBe(true);
  });

  it("rejeita estado desconhecido", () => {
    expect(
      funcionarioEstadoSchema.safeParse({ estado: "BLOQUEADO" }).success,
    ).toBe(false);
  });
});
