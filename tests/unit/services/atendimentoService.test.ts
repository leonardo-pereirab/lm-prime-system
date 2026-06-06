import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  InvalidTransitionError,
  NotFoundError,
  ValidationError,
} from "@/domain/errors";
import { atendimentoRepository } from "@/repositories/atendimentoRepository";
import { atendimentoService } from "@/services/atendimentoService";

vi.mock("@/repositories/atendimentoRepository", () => ({
  atendimentoRepository: {
    criarComCodigo: vi.fn(),
    listarPaginado: vi.fn(),
    listarFilaOrcamentos: vi.fn(),
    listarFilaReservas: vi.fn(),
    buscarComEtapas: vi.fn(),
    atualizar: vi.fn(),
  },
}));

const repo = vi.mocked(atendimentoRepository);

describe("atendimentoService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-05T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("cria atendimento com usuario responsavel e status inicial", async () => {
    repo.criarComCodigo.mockResolvedValueOnce({ id: "atd-1" } as never);

    await atendimentoService.criar(
      {
        tipoServico: "VIAGEM",
        dataContato: new Date(),
        qtdPassageiros: 10,
        trajeto: [],
      } as never,
      "usuario-1",
    );

    expect(repo.criarComCodigo).toHaveBeenCalledWith(
      2026,
      expect.objectContaining({
        status: "EM_SOLICITACAO",
        criadoPor: "usuario-1",
      }),
    );
  });

  it("falha ao criar sem usuario responsavel", async () => {
    await expect(
      atendimentoService.criar({ tipoServico: "VIAGEM" } as never),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("falha ao buscar atendimento inexistente", async () => {
    repo.buscarComEtapas.mockResolvedValueOnce(null);

    await expect(
      atendimentoService.buscarPorId("atd-1"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("atualiza solicitacao somente enquanto estiver em solicitacao", async () => {
    repo.buscarComEtapas.mockResolvedValueOnce({
      id: "atd-1",
      status: "EM_SOLICITACAO",
    } as never);
    repo.atualizar.mockResolvedValueOnce({ id: "atd-1" } as never);

    await atendimentoService.atualizarSolicitacao("atd-1", {
      observacoes: "Ajuste",
    });

    expect(repo.atualizar).toHaveBeenCalledWith("atd-1", {
      observacoes: "Ajuste",
    });
  });

  it("bloqueia atualizacao de solicitacao fora da etapa inicial", async () => {
    repo.buscarComEtapas.mockResolvedValueOnce({
      id: "atd-1",
      status: "AGUARDANDO_ORCAMENTO",
    } as never);

    await expect(
      atendimentoService.atualizarSolicitacao("atd-1", {
        observacoes: "Ajuste",
      }),
    ).rejects.toBeInstanceOf(InvalidTransitionError);
  });

  it("avanca status validos do fluxo", async () => {
    repo.buscarComEtapas
      .mockResolvedValueOnce({ id: "atd-1", status: "EM_SOLICITACAO" } as never)
      .mockResolvedValueOnce({
        id: "atd-1",
        status: "ORCAMENTO_REGISTRADO_AG_APROVACAO",
      } as never)
      .mockResolvedValueOnce({
        id: "atd-1",
        status: "ESCALA_DEFINIDA",
      } as never);

    await atendimentoService.avancarParaOrcamento("atd-1");
    await atendimentoService.avancarParaReserva("atd-1");
    await atendimentoService.iniciarServico("atd-1");

    expect(repo.atualizar).toHaveBeenNthCalledWith(1, "atd-1", {
      status: "AGUARDANDO_ORCAMENTO",
    });
    expect(repo.atualizar).toHaveBeenNthCalledWith(2, "atd-1", {
      status: "AGUARDANDO_RESERVA",
    });
    expect(repo.atualizar).toHaveBeenNthCalledWith(3, "atd-1", {
      status: "SERVICO_EM_ANDAMENTO",
    });
  });

  it("cancela registrando status anterior, data e usuario", async () => {
    repo.buscarComEtapas.mockResolvedValueOnce({
      id: "atd-1",
      status: "AGUARDANDO_ORCAMENTO",
    } as never);

    await atendimentoService.cancelar("atd-1", "ORCAMENTO_CANCELADO", "user-1");

    expect(repo.atualizar).toHaveBeenCalledWith(
      "atd-1",
      expect.objectContaining({
        status: "ORCAMENTO_CANCELADO",
        statusAnteriorCancelamento: "AGUARDANDO_ORCAMENTO",
        canceladoPor: "user-1",
        canceladoEm: expect.any(Date),
      }),
    );
  });
});
