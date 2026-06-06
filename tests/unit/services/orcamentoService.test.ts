import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  InvalidTransitionError,
  NotFoundError,
  ValidationError,
} from "@/domain/errors";
import { prisma } from "@/lib/prisma";
import { orcamentoRepository } from "@/repositories/orcamentoRepository";
import { orcamentoService } from "@/services/orcamentoService";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    atendimento: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/repositories/orcamentoRepository", () => ({
  orcamentoRepository: {
    listar: vi.fn(),
    buscarPorId: vi.fn(),
    buscarPorAtendimentoId: vi.fn(),
    atualizar: vi.fn(),
    listarVencidosPendentes: vi.fn(),
  },
}));

const repo = vi.mocked(orcamentoRepository);
const prismaMock = vi.mocked(prisma);
const atendimentoFindUnique = prismaMock.atendimento
  .findUnique as unknown as ReturnType<typeof vi.fn>;
const transaction = prismaMock.$transaction as unknown as ReturnType<
  typeof vi.fn
>;

const tx = {
  orcamento: {
    create: vi.fn(),
    findUnique: vi.fn(),
  },
  atendimento: {
    update: vi.fn(),
  },
};

describe("orcamentoService", () => {
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

  it("lista somente orcamentos ativos", async () => {
    await orcamentoService.listar({ atendimentoId: "atd-1" });

    expect(repo.listar).toHaveBeenCalledWith({
      somenteAtivos: true,
      atendimentoId: "atd-1",
    });
  });

  it("falha ao buscar orcamento inexistente", async () => {
    repo.buscarPorId.mockResolvedValueOnce(null);

    await expect(orcamentoService.buscarPorId("orc-1")).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it("cria orcamento e atualiza atendimento em transacao", async () => {
    atendimentoFindUnique.mockResolvedValueOnce({
      id: "atd-1",
      status: "AGUARDANDO_ORCAMENTO",
    } as never);
    tx.orcamento.create.mockResolvedValueOnce({ id: "orc-1" });

    await orcamentoService.criar("atd-1", {
      valorTotal: 1000,
      formaPagamento: "PIX",
      veiculosPrevistos: [{ tipo: "VAN", quantidade: 1 }],
    });

    expect(tx.orcamento.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        atendimentoId: "atd-1",
        createdAt: new Date("2026-06-05T12:00:00.000Z"),
        validoAte: new Date("2026-06-12T12:00:00.000Z"),
      }),
    });
    expect(tx.atendimento.update).toHaveBeenCalledWith({
      where: { id: "atd-1" },
      data: { status: "ORCAMENTO_REGISTRADO_AG_APROVACAO" },
    });
  });

  it("bloqueia criacao sem dados ou em atendimento invalido", async () => {
    await expect(orcamentoService.criar("atd-1")).rejects.toBeInstanceOf(
      ValidationError,
    );

    atendimentoFindUnique.mockResolvedValueOnce({
      id: "atd-1",
      status: "EM_SOLICITACAO",
    } as never);
    await expect(
      orcamentoService.criar("atd-1", {
        valorTotal: 1000,
        formaPagamento: "PIX",
        veiculosPrevistos: [{ tipo: "VAN", quantidade: 1 }],
      }),
    ).rejects.toBeInstanceOf(InvalidTransitionError);
  });

  it("bloqueia atualizacao em status terminal", async () => {
    repo.buscarPorId.mockResolvedValueOnce({
      id: "orc-1",
      atendimento: { status: "ORCAMENTO_CANCELADO" },
    } as never);

    await expect(
      orcamentoService.atualizar("orc-1", { observacoes: "Ajuste" }),
    ).rejects.toBeInstanceOf(InvalidTransitionError);
  });

  it("cancela orcamentos vencidos pendentes", async () => {
    const referencia = new Date("2026-06-05T12:00:00.000Z");
    repo.listarVencidosPendentes.mockResolvedValueOnce([
      {
        id: "orc-1",
        atendimentoId: "atd-1",
        atendimento: { status: "ORCAMENTO_REGISTRADO_AG_APROVACAO" },
      },
    ] as never);

    await expect(
      orcamentoService.cancelarVencidos(referencia),
    ).resolves.toEqual({
      processados: 1,
      cancelados: 1,
    });
    expect(tx.atendimento.update).toHaveBeenCalledWith({
      where: { id: "atd-1" },
      data: {
        status: "ORCAMENTO_CANCELADO",
        statusAnteriorCancelamento: "ORCAMENTO_REGISTRADO_AG_APROVACAO",
        canceladoEm: referencia,
      },
    });
  });

  it("valida aprovacao para reserva somente com orcamento existente e vigente", async () => {
    repo.buscarPorAtendimentoId.mockResolvedValueOnce(null);
    await expect(
      orcamentoService.validarAprovacaoParaReserva("atd-1"),
    ).rejects.toBeInstanceOf(ValidationError);

    repo.buscarPorAtendimentoId.mockResolvedValueOnce({
      id: "orc-1",
      validoAte: new Date("2026-06-04T12:00:00.000Z"),
    } as never);
    await expect(
      orcamentoService.validarAprovacaoParaReserva("atd-1"),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
