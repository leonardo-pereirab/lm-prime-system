import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  InvalidTransitionError,
  NotFoundError,
  ValidationError,
} from "@/domain/errors";
import { prisma } from "@/lib/prisma";
import { escalaRepository } from "@/repositories/escalaRepository";
import { escalaService } from "@/services/escalaService";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    atendimento: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/repositories/escalaRepository", () => ({
  escalaRepository: {
    listar: vi.fn(),
    buscarPorAtendimento: vi.fn(),
    atualizar: vi.fn(),
    criar: vi.fn(),
  },
}));

const repo = vi.mocked(escalaRepository);
const prismaMock = vi.mocked(prisma);
const atendimentoFindUnique = prismaMock.atendimento
  .findUnique as unknown as ReturnType<typeof vi.fn>;
const transaction = prismaMock.$transaction as unknown as ReturnType<
  typeof vi.fn
>;

const tx = {
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
  atendimento: {
    update: vi.fn(),
  },
};

const payload = {
  motoristaIds: ["motorista-1"],
  veiculoIds: ["veiculo-1"],
  parceiros: [],
};

describe("escalaService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-05T12:00:00.000Z"));
    transaction.mockImplementation(
      async (callback: (transaction: typeof tx) => unknown) => callback(tx),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("falha ao buscar escala inexistente", async () => {
    repo.buscarPorAtendimento.mockResolvedValueOnce(null);

    await expect(
      escalaService.buscarPorAtendimento("atd-1"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("define nova escala e atualiza status do atendimento", async () => {
    atendimentoFindUnique.mockResolvedValueOnce({
      id: "atd-1",
      status: "RESERVA_REGISTRADA_AG_ESCALA",
    } as never);
    tx.escala.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: "escala-1",
    });
    tx.escala.create.mockResolvedValueOnce({ id: "escala-1" });

    await escalaService.definir("atd-1", payload);

    expect(tx.escala.create).toHaveBeenCalledWith({
      data: { atendimentoId: "atd-1", observacoes: undefined },
      select: { id: true },
    });
    expect(tx.escalaMotorista.createMany).toHaveBeenCalledWith({
      data: [{ escalaId: "escala-1", motoristaId: "motorista-1" }],
    });
    expect(tx.atendimento.update).toHaveBeenCalledWith({
      where: { id: "atd-1" },
      data: { status: "ESCALA_DEFINIDA" },
    });
  });

  it("bloqueia definicao em atendimento inexistente ou status invalido", async () => {
    atendimentoFindUnique.mockResolvedValueOnce(null);
    await expect(
      escalaService.definir("atd-1", payload),
    ).rejects.toBeInstanceOf(NotFoundError);

    atendimentoFindUnique.mockResolvedValueOnce({
      id: "atd-1",
      status: "EM_SOLICITACAO",
    } as never);
    await expect(
      escalaService.definir("atd-1", payload),
    ).rejects.toBeInstanceOf(InvalidTransitionError);
  });

  it("atualiza parcialmente via repositorio quando payload nao contem ids", async () => {
    await escalaService.atualizar("atd-1", { observacoes: "Ajuste" });

    expect(repo.atualizar).toHaveBeenCalledWith("atd-1", {
      observacoes: "Ajuste",
    });
  });

  it("bloqueia atualizacao completa sem data de servico ou com status bloqueado", async () => {
    atendimentoFindUnique.mockResolvedValueOnce({
      id: "atd-1",
      status: "ESCALA_DEFINIDA",
      dataServico: null,
    } as never);
    await expect(
      escalaService.atualizar("atd-1", payload),
    ).rejects.toBeInstanceOf(ValidationError);

    atendimentoFindUnique.mockResolvedValueOnce({
      id: "atd-1",
      status: "SERVICO_FINALIZADO",
      dataServico: new Date("2026-06-10"),
    } as never);
    await expect(
      escalaService.atualizar("atd-1", payload),
    ).rejects.toBeInstanceOf(InvalidTransitionError);
  });

  it("bloqueia atualizacao apos a data do servico", async () => {
    atendimentoFindUnique.mockResolvedValueOnce({
      id: "atd-1",
      status: "ESCALA_DEFINIDA",
      dataServico: new Date("2026-06-04T12:00:00.000Z"),
    } as never);

    await expect(
      escalaService.atualizar("atd-1", payload),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
