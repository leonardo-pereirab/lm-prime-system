import { describe, expect, it } from "vitest";

import { reservaInputSchema, reservaUpdateSchema } from "@/schemas/reserva";

const clienteIdExistente = "clx0000000000000000000000";

const novoCliente = {
  nome: "Cliente Reserva",
  cpfCnpj: "52998224725",
  telefone: "11987654321",
};

describe("reservaInputSchema", () => {
  it("aceita reserva com cliente existente", () => {
    const resultado = reservaInputSchema.parse({
      clienteIdExistente,
      confirmadaEm: "2026-06-05",
    });

    expect(resultado.clienteIdExistente).toBe(clienteIdExistente);
    expect(resultado.confirmadaEm).toBeInstanceOf(Date);
  });

  it("aceita reserva com novo cliente", () => {
    const resultado = reservaInputSchema.safeParse({ novoCliente });

    expect(resultado.success).toBe(true);
  });

  it("rejeita reserva sem cliente existente ou novo cliente", () => {
    const resultado = reservaInputSchema.safeParse({
      observacoes: "Cliente confirmou pelo WhatsApp.",
    });

    expect(resultado.success).toBe(false);
  });

  it("rejeita novo cliente invalido", () => {
    const resultado = reservaInputSchema.safeParse({
      novoCliente: {
        ...novoCliente,
        telefone: "123",
      },
    });

    expect(resultado.success).toBe(false);
  });
});

describe("reservaUpdateSchema", () => {
  it("aceita atualizacao parcial sem exigir cliente", () => {
    expect(
      reservaUpdateSchema.safeParse({ observacoes: "Atualizada" }).success,
    ).toBe(true);
  });
});
