import { describe, expect, it } from "vitest";

import { clienteInputSchema, clienteUpdateSchema } from "@/schemas/cliente";

const clienteValido = {
  nome: "Maria Prime",
  cpfCnpj: "52998224725",
  telefone: "11987654321",
  email: "maria@example.com",
  cep: "12345678",
  estado: "sp",
};

describe("clienteInputSchema", () => {
  it("aceita cliente valido e normaliza estado", () => {
    const resultado = clienteInputSchema.parse(clienteValido);

    expect(resultado.nome).toBe("Maria Prime");
    expect(resultado.estado).toBe("SP");
  });

  it("converte email e telefone secundario vazios para undefined", () => {
    const resultado = clienteInputSchema.parse({
      ...clienteValido,
      email: "",
      telefoneSec: "",
    });

    expect(resultado.email).toBeUndefined();
    expect(resultado.telefoneSec).toBeUndefined();
  });

  it("rejeita nome curto, documento invalido e telefone invalido", () => {
    expect(
      clienteInputSchema.safeParse({ ...clienteValido, nome: "LM" }).success,
    ).toBe(false);
    expect(
      clienteInputSchema.safeParse({ ...clienteValido, cpfCnpj: "123" })
        .success,
    ).toBe(false);
    expect(
      clienteInputSchema.safeParse({ ...clienteValido, telefone: "123" })
        .success,
    ).toBe(false);
  });

  it("rejeita email, cep e estado invalidos", () => {
    expect(
      clienteInputSchema.safeParse({ ...clienteValido, email: "email" })
        .success,
    ).toBe(false);
    expect(
      clienteInputSchema.safeParse({ ...clienteValido, cep: "1234567" })
        .success,
    ).toBe(false);
    expect(
      clienteInputSchema.safeParse({ ...clienteValido, estado: "sao" }).success,
    ).toBe(false);
  });
});

describe("clienteUpdateSchema", () => {
  it("aceita atualizacao parcial e aplica transformacoes dos campos enviados", () => {
    const resultado = clienteUpdateSchema.parse({ estado: "rj" });

    expect(resultado.estado).toBe("RJ");
  });
});
