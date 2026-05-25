import { describe, expect, it, beforeEach, vi } from "vitest";
import { InvalidTransitionError, ValidationError } from "@/domain/errors";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    atendimento: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    escala: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    escalaMotorista: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    escalaVeiculo: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    escalaParceiro: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("@/repositories/escalaRepository", () => ({
  escalaRepository: {
    listar: vi.fn(),
    buscarPorAtendimento: vi.fn(),
  },
}));

import { escalaService } from "@/services/escalaService";

describe("escalaService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(
      async (callback: (client: typeof prismaMock) => unknown) =>
        callback(prismaMock),
    );
    prismaMock.escala.findUnique.mockResolvedValueOnce(null);
    prismaMock.escala.create.mockResolvedValue({ id: "esc-1" });
    prismaMock.escala.findUnique.mockResolvedValue({
      id: "esc-1",
      motoristas: [],
      veiculos: [],
      parceiros: [],
    });
  });

  it("deve permitir definir escala em atendimento apto", async () => {
    prismaMock.atendimento.findUnique.mockResolvedValueOnce({
      id: "atd-1",
      status: "RESERVA_REGISTRADA_AG_ESCALA",
    });

    await escalaService.definir("atd-1", {
      observacoes: "Escala inicial",
      motoristaIds: ["mot-1"],
      veiculoIds: ["vei-1"],
      parceiros: [],
    });

    expect(prismaMock.atendimento.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "ESCALA_DEFINIDA" } }),
    );
  });

  it("deve bloquear atualizacao quando atendimento estiver com servico em andamento", async () => {
    prismaMock.atendimento.findUnique.mockResolvedValueOnce({
      id: "atd-1",
      status: "SERVICO_EM_ANDAMENTO",
      dataServico: new Date("2026-12-30T00:00:00.000Z"),
    });

    await expect(
      escalaService.atualizar("atd-1", {
        motoristaIds: ["mot-1"],
        veiculoIds: [],
        parceiros: [],
      }),
    ).rejects.toBeInstanceOf(InvalidTransitionError);
  });

  it("deve bloquear atualizacao quando data do servico estiver no passado", async () => {
    prismaMock.atendimento.findUnique.mockResolvedValueOnce({
      id: "atd-1",
      status: "ESCALA_DEFINIDA",
      dataServico: new Date("2020-01-01T00:00:00.000Z"),
    });

    await expect(
      escalaService.atualizar("atd-1", {
        motoristaIds: ["mot-1"],
        veiculoIds: [],
        parceiros: [],
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
