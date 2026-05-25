import { describe, expect, it, beforeEach, vi } from "vitest";
import { InvalidTransitionError, ValidationError } from "@/domain/errors";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    atendimento: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    cliente: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    reserva: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("@/repositories/reservaRepository", () => ({
  reservaRepository: {
    listar: vi.fn(),
    buscarPorId: vi.fn(),
    buscarPorAtendimentoId: vi.fn(),
    atualizar: vi.fn(),
  },
}));

import { reservaRepository } from "@/repositories/reservaRepository";
import { reservaService } from "@/services/reservaService";

describe("reservaService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(
      async (callback: (client: typeof prismaMock) => unknown) =>
        callback(prismaMock),
    );
  });

  it("deve converter lead em cliente e criar reserva", async () => {
    prismaMock.atendimento.findUnique.mockResolvedValueOnce({
      id: "atd-1",
      status: "AGUARDANDO_RESERVA",
      clienteId: null,
      leadNome: "Lead",
      leadTelefone: "11999999999",
    });
    prismaMock.cliente.findUnique.mockResolvedValueOnce(null);
    prismaMock.cliente.create.mockResolvedValueOnce({ id: "cli-1" });
    prismaMock.reserva.create.mockResolvedValueOnce({ id: "res-1" });

    await reservaService.criar("atd-1", {
      novoCliente: {
        nome: "Cliente Novo",
        cpfCnpj: "12345678901",
        telefone: "11999999999",
      },
    });

    expect(prismaMock.cliente.create).toHaveBeenCalled();
    expect(prismaMock.atendimento.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "RESERVA_REGISTRADA_AG_ESCALA",
        }),
      }),
    );
  });

  it("deve reutilizar cliente existente quando clienteId for informado", async () => {
    prismaMock.atendimento.findUnique.mockResolvedValueOnce({
      id: "atd-1",
      status: "AGUARDANDO_RESERVA",
      clienteId: null,
      leadNome: "Lead",
      leadTelefone: "11999999999",
    });
    prismaMock.cliente.findUnique.mockResolvedValueOnce({ id: "cli-2" });
    prismaMock.reserva.create.mockResolvedValueOnce({ id: "res-1" });

    await reservaService.criar("atd-1", {
      clienteIdExistente: "cli-2",
    });

    expect(prismaMock.cliente.create).not.toHaveBeenCalled();
    expect(prismaMock.atendimento.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ clienteId: "cli-2" }),
      }),
    );
  });

  it("deve bloquear criacao de reserva em status invalido", async () => {
    prismaMock.atendimento.findUnique.mockResolvedValueOnce({
      id: "atd-1",
      status: "EM_SOLICITACAO",
      clienteId: null,
      leadNome: "Lead",
      leadTelefone: "11999999999",
    });

    await expect(
      reservaService.criar("atd-1", {
        novoCliente: {
          nome: "Cliente Novo",
          cpfCnpj: "12345678901",
          telefone: "11999999999",
        },
      }),
    ).rejects.toBeInstanceOf(InvalidTransitionError);
  });

  it("deve exigir dados completos quando atendimento nao tiver cliente vinculado", async () => {
    prismaMock.atendimento.findUnique.mockResolvedValueOnce({
      id: "atd-1",
      status: "AGUARDANDO_RESERVA",
      clienteId: null,
      leadNome: "Lead",
      leadTelefone: "11999999999",
    });

    await expect(reservaService.criar("atd-1", {})).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it("deve bloquear atualizacao de reserva cancelada", async () => {
    vi.mocked(reservaRepository.buscarPorId).mockResolvedValueOnce({
      id: "res-1",
      atendimento: { status: "RESERVA_CANCELADA" },
    } as never);

    await expect(reservaService.atualizar("res-1", {})).rejects.toBeInstanceOf(
      InvalidTransitionError,
    );
  });

  it("deve cancelar reserva e mover atendimento para RESERVA_CANCELADA", async () => {
    vi.mocked(reservaRepository.buscarPorId).mockResolvedValueOnce({
      id: "res-1",
      atendimentoId: "atd-1",
      atendimento: { status: "RESERVA_REGISTRADA_AG_ESCALA" },
    } as never);

    await reservaService.cancelar("res-1", "usr-1");

    expect(prismaMock.atendimento.update).toHaveBeenCalledWith({
      where: { id: "atd-1" },
      data: {
        status: "RESERVA_CANCELADA",
        statusAnteriorCancelamento: "RESERVA_REGISTRADA_AG_ESCALA",
        canceladoEm: expect.any(Date),
        canceladoPor: "usr-1",
      },
    });
  });
});
