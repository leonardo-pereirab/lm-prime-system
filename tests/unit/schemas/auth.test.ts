import { describe, expect, it } from "vitest";

import {
  ativacaoConclusaoInputSchema,
  ativacaoValidacaoInputSchema,
  loginInputSchema,
} from "@/schemas/auth";

describe("loginInputSchema", () => {
  it("aceita login valido", () => {
    const resultado = loginInputSchema.safeParse({
      email: "usuario@lmprime.com",
      senha: "senha",
    });

    expect(resultado.success).toBe(true);
  });

  it("rejeita email invalido ou senha vazia", () => {
    expect(
      loginInputSchema.safeParse({ email: "email", senha: "senha" }).success,
    ).toBe(false);
    expect(
      loginInputSchema.safeParse({
        email: "usuario@lmprime.com",
        senha: "",
      }).success,
    ).toBe(false);
  });
});

describe("ativacaoValidacaoInputSchema", () => {
  it("aceita email e matricula validos com trim", () => {
    const resultado = ativacaoValidacaoInputSchema.parse({
      email: "usuario@lmprime.com",
      matricula: "  MAT123  ",
    });

    expect(resultado.matricula).toBe("MAT123");
  });

  it("rejeita matricula curta ou longa demais", () => {
    expect(
      ativacaoValidacaoInputSchema.safeParse({
        email: "usuario@lmprime.com",
        matricula: "AB",
      }).success,
    ).toBe(false);
    expect(
      ativacaoValidacaoInputSchema.safeParse({
        email: "usuario@lmprime.com",
        matricula: "A".repeat(21),
      }).success,
    ).toBe(false);
  });
});

describe("ativacaoConclusaoInputSchema", () => {
  const ativacaoValida = {
    email: "usuario@lmprime.com",
    matricula: "MAT123",
    senha: "senha123",
    confirmarSenha: "senha123",
    aceitouTermos: true,
  };

  it("aceita ativacao valida e aplica versao padrao dos termos", () => {
    const resultado = ativacaoConclusaoInputSchema.parse(ativacaoValida);

    expect(resultado.versaoTermosAceita).toBe("v1");
  });

  it("converte telefone adicional vazio para undefined", () => {
    const resultado = ativacaoConclusaoInputSchema.parse({
      ...ativacaoValida,
      telefoneAdicional: "",
    });

    expect(resultado.telefoneAdicional).toBeUndefined();
  });

  it("rejeita senhas divergentes, senha curta ou termos nao aceitos", () => {
    expect(
      ativacaoConclusaoInputSchema.safeParse({
        ...ativacaoValida,
        confirmarSenha: "outra123",
      }).success,
    ).toBe(false);
    expect(
      ativacaoConclusaoInputSchema.safeParse({
        ...ativacaoValida,
        senha: "123",
        confirmarSenha: "123",
      }).success,
    ).toBe(false);
    expect(
      ativacaoConclusaoInputSchema.safeParse({
        ...ativacaoValida,
        aceitouTermos: false,
      }).success,
    ).toBe(false);
  });

  it("rejeita telefone adicional invalido", () => {
    expect(
      ativacaoConclusaoInputSchema.safeParse({
        ...ativacaoValida,
        telefoneAdicional: "123",
      }).success,
    ).toBe(false);
  });
});
