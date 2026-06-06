import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  InvalidTransitionError,
  NotFoundError,
  ValidationError,
} from "@/domain/errors";
import { prisma } from "@/lib/prisma";
import { reservaRepository } from "@/repositories/reservaRepository";
import { reservaService } from "@/services/reservaService";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    atendimento: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/repositories/reservaRepository", () => ({
  reservaRepository: {
    listar: vi.fn(),
    buscarPorId: vi.fn(),
    buscarPorAtendimentoId: vi.fn(),
    atualizar: vi.fn(),
  },
}));

const repo = vi.mocked(reservaRepository);
const prismaMock = vi.mocked(prisma);
const atendimentoFindUnique = prismaMock.atendimento
  .findUnique as unknown as ReturnType<typeof vi.fn>;
const transaction = prismaMock.$transaction as unknown as ReturnType<
  typeof vi.fn
>;

const tx = {
  cliente: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  atendimento: {
    update: vi.fn(),
  },
  reserva: {
    create: vi.fn(),
  },
};

const novoCliente = {
  nome: "Cliente Reserva",
  cpfCnpj: "52998224725",
  telefone: "11987654321",
};

describe("reservaService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transaction.mockImplementation(
      async (callback: (transaction: typeof tx) => unknown) => callback(tx),
    );
  });

  it("falha ao buscar reserva inexistente", async () => {
    repo.buscarPorId.mockResolvedValueOnce(null);

    await expect(
      reservaService.buscarPorId("reserva-1"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("cria reserva usando cliente existente informado", async () => {
    atendimentoFindUnique.mockResolvedValueOnce({
      id: "atd-1",
      status: "AGUARDANDO_RESERVA",
      clienteId: null,
    } as never);
    tx.cliente.findUnique.mockResolvedValueOnce({ id: "cliente-1" });
    tx.reserva.create.mockResolvedValueOnce({ id: "reserva-1" });

    await reservaService.criar("atd-1", {
      clienteIdExistente: "cliente-1",
    });

    expect(tx.atendimento.update).toHaveBeenNthCalledWith(1, {
      where: { id: "atd-1" },
      data: { clienteId: "cliente-1" },
    });
    expect(tx.atendimento.update).toHaveBeenNthCalledWith(2, {
      where: { id: "atd-1" },
      data: { status: "RESERVA_REGISTRADA_AG_ESCALA" },
    });
  });

  it("cria novo cliente quando lead ainda nao possui cadastro", async () => {
    atendimentoFindUnique.mockResolvedValueOnce({
      id: "atd-1",
      status: "AGUARDANDO_RESERVA",
      clienteId: null,
    } as never);
    tx.cliente.findUnique.mockResolvedValueOnce(null);
    tx.cliente.create.mockResolvedValueOnce({ id: "cliente-novo" });
    tx.reserva.create.mockResolvedValueOnce({ id: "reserva-1" });

    await reservaService.criar("atd-1", {
      novoCliente,
    });

    expect(tx.cliente.create).toHaveBeenCalledWith({ data: novoCliente });
    expect(tx.atendimento.update).toHaveBeenCalledWith({
      where: { id: "atd-1" },
      data: { clienteId: "cliente-novo" },
    });
  });

  it("bloqueia criacao sem dados ou em atendimento invalido", async () => {
    await expect(reservaService.criar("atd-1")).rejects.toBeInstanceOf(
      ValidationError,
    );

    atendimentoFindUnique.mockResolvedValueOnce({
      id: "atd-1",
      status: "EM_SOLICITACAO",
    } as never);
    await expect(
      reservaService.criar("atd-1", { clienteIdExistente: "cliente-1" }),
    ).rejects.toBeInstanceOf(InvalidTransitionError);
  });

  it("bloqueia atualizacao de reserva cancelada", async () => {
    repo.buscarPorId.mockResolvedValueOnce({
      id: "reserva-1",
      atendimento: { status: "RESERVA_CANCELADA" },
    } as never);

    await expect(
      reservaService.atualizar("reserva-1", { observacoes: "Ajuste" }),
    ).rejects.toBeInstanceOf(InvalidTransitionError);
  });

  it("cancela reserva atualizando atendimento e retorna a reserva", async () => {
    const reserva = {
      id: "reserva-1",
      atendimentoId: "atd-1",
      atendimento: { status: "RESERVA_REGISTRADA_AG_ESCALA" },
    };
    repo.buscarPorId.mockResolvedValueOnce(reserva as never);

    await expect(
      reservaService.cancelar("reserva-1", "usuario-1"),
    ).resolves.toBe(reserva);
    expect(prismaMock.atendimento.update).toHaveBeenCalledWith({
      where: { id: "atd-1" },
      data: expect.objectContaining({
        status: "RESERVA_CANCELADA",
        statusAnteriorCancelamento: "RESERVA_REGISTRADA_AG_ESCALA",
        canceladoPor: "usuario-1",
      }),
    });
  });
});
