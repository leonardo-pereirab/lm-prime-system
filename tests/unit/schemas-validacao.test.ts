import { describe, expect, it } from "vitest";
import { clienteInputSchema } from "@/schemas/cliente";

describe("schemas de validacao", () => {
  it("deve aceitar cliente com campos obrigatorios preenchidos", () => {
    const resultado = clienteInputSchema.safeParse({
      nome: "Cliente Teste",
      cpfCnpj: "11144477735",
      telefone: "11999999999",
    });

    expect(resultado.success).toBe(true);
  });

  it("deve rejeitar cliente com campos obrigatorios ausentes", () => {
    const resultado = clienteInputSchema.safeParse({
      nome: "A",
      cpfCnpj: "123",
    });

    expect(resultado.success).toBe(false);
  });
});
