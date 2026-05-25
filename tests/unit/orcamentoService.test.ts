import { describe, expect, it, beforeEach, vi } from "vitest";
import { InvalidTransitionError, ValidationError } from "@/domain/errors";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    atendimento: {
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    orcamento: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("@/repositories/orcamentoRepository", () => ({
  orcamentoRepository: {
    listar: vi.fn(),
    buscarPorId: vi.fn(),
    buscarPorAtendimentoId: vi.fn(),
    listarVencidosPendentes: vi.fn(),
    atualizar: vi.fn(),
  },
}));

import { orcamentoRepository } from "@/repositories/orcamentoRepository";
import { orcamentoService } from "@/services/orcamentoService";

describe("orcamentoService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    prismaMock.$transaction.mockImplementation(
      async (callback: (client: typeof prismaMock) => unknown) =>
        callback(prismaMock),
    );
  });

  it("deve criar orcamento com validade de 7 dias e atualizar status do atendimento", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-20T10:00:00.000Z"));

    prismaMock.atendimento.findUnique.mockResolvedValueOnce({
      id: "atd-1",
      status: "AGUARDANDO_ORCAMENTO",
    });
    prismaMock.orcamento.create.mockResolvedValueOnce({ id: "orc-1" });

    await orcamentoService.criar("atd-1", {
      valorTotal: "1500.00" as never,
      formaPagamento: "PIX",
      veiculosPrevistos: [{ tipo: "VAN", quantidade: 1 }],
    });

    const chamadaCriacao = prismaMock.orcamento.create.mock.calls[0]?.[0];
    expect(chamadaCriacao?.data?.createdAt).toEqual(
      new Date("2026-05-20T10:00:00.000Z"),
    );
    expect(chamadaCriacao?.data?.validoAte).toEqual(
      new Date("2026-05-27T10:00:00.000Z"),
    );
    expect(chamadaCriacao?.data?.validoAte).toBeInstanceOf(Date);
    expect(prismaMock.atendimento.update).toHaveBeenCalledWith({
      where: { id: "atd-1" },
      data: { status: "ORCAMENTO_REGISTRADO_AG_APROVACAO" },
    });
  });

  it("deve bloquear atualizacao quando atendimento estiver em estado terminal", async () => {
    vi.mocked(orcamentoRepository.buscarPorId).mockResolvedValueOnce({
      id: "orc-1",
      atendimento: {
        status: "ORCAMENTO_CANCELADO",
      },
    } as never);

    await expect(
      orcamentoService.atualizar("orc-1", {}),
    ).rejects.toBeInstanceOf(InvalidTransitionError);
  });

  it("deve validar aprovacao para reserva quando orcamento estiver vencido", async () => {
    vi.mocked(orcamentoRepository.buscarPorAtendimentoId).mockResolvedValueOnce(
      {
        id: "orc-1",
        validoAte: new Date("2026-01-01T00:00:00.000Z"),
      } as never,
    );

    await expect(
      orcamentoService.validarAprovacaoParaReserva("atd-1"),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("deve cancelar orcamentos vencidos retornados pelo repositorio", async () => {
    vi.mocked(
      orcamentoRepository.listarVencidosPendentes,
    ).mockResolvedValueOnce([
      {
        id: "orc-1",
        atendimentoId: "atd-1",
        atendimento: { status: "ORCAMENTO_REGISTRADO_AG_APROVACAO" },
      },
    ] as never);

    const resultado = await orcamentoService.cancelarVencidos();

    expect(prismaMock.atendimento.updateMany).toHaveBeenCalled();
    expect(resultado.totalCancelados).toBe(1);
  });

  it("deve cancelar manualmente e atualizar status do atendimento", async () => {
    vi.mocked(orcamentoRepository.buscarPorId).mockResolvedValueOnce({
      id: "orc-1",
      atendimentoId: "atd-1",
      atendimento: { status: "ORCAMENTO_REGISTRADO_AG_APROVACAO" },
    } as never);

    prismaMock.orcamento.findUnique.mockResolvedValueOnce({ id: "orc-1" });

    await orcamentoService.cancelarManual("orc-1", "usr-1");

    expect(prismaMock.atendimento.update).toHaveBeenCalledWith({
      where: { id: "atd-1" },
      data: {
        status: "ORCAMENTO_CANCELADO",
        statusAnteriorCancelamento: "ORCAMENTO_REGISTRADO_AG_APROVACAO",
        canceladoEm: expect.any(Date),
        canceladoPor: "usr-1",
      },
    });
  });
});
