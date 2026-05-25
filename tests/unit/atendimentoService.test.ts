import { describe, expect, it, beforeEach, vi } from "vitest";
import { InvalidTransitionError, ValidationError } from "@/domain/errors";

vi.mock("@/repositories/atendimentoRepository", () => ({
  atendimentoRepository: {
    criarComCodigo: vi.fn(),
    listarPaginado: vi.fn(),
    buscarComEtapas: vi.fn(),
    atualizar: vi.fn(),
  },
}));

import { atendimentoRepository } from "@/repositories/atendimentoRepository";
import { atendimentoService } from "@/services/atendimentoService";

function criarSolicitacaoBase() {
  return {
    leadNome: "Lead Teste",
    leadTelefone: "11999999999",
    tipoServico: "VIAGEM" as const,
    dataContato: new Date("2026-01-10T00:00:00.000Z"),
    precisaNotaFiscal: false,
    qtdPassageiros: 4,
    trajeto: [
      {
        origem: "São Paulo",
        destino: "Campinas",
        data: new Date("2026-01-15T00:00:00.000Z"),
        hora: "08:00",
      },
    ],
  };
}

describe("atendimentoService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve gerar codigo incremental ao criar atendimento", async () => {
    vi.mocked(atendimentoRepository.criarComCodigo).mockResolvedValueOnce({
      id: "atd-1",
      codigo: "ATD-2026-00042",
    } as never);

    await atendimentoService.criar(criarSolicitacaoBase(), "usr-1");

    expect(atendimentoRepository.criarComCodigo).toHaveBeenCalledWith(
      expect.any(Number),
      expect.objectContaining({
        status: "EM_SOLICITACAO",
        criadoPor: "usr-1",
      }),
    );
  });

  it("deve permitir avancar para orcamento a partir de EM_SOLICITACAO", async () => {
    vi.mocked(atendimentoRepository.buscarComEtapas).mockResolvedValueOnce({
      id: "atd-1",
      status: "EM_SOLICITACAO",
    } as never);
    vi.mocked(atendimentoRepository.atualizar).mockResolvedValueOnce({
      id: "atd-1",
      status: "AGUARDANDO_ORCAMENTO",
    } as never);

    await atendimentoService.avancarParaOrcamento("atd-1");

    expect(atendimentoRepository.atualizar).toHaveBeenCalledWith("atd-1", {
      status: "AGUARDANDO_ORCAMENTO",
    });
  });

  it("deve bloquear transicao invalida que pula etapas", async () => {
    vi.mocked(atendimentoRepository.buscarComEtapas).mockResolvedValueOnce({
      id: "atd-1",
      status: "EM_SOLICITACAO",
    } as never);

    await expect(
      atendimentoService.avancarParaReserva("atd-1"),
    ).rejects.toBeInstanceOf(InvalidTransitionError);

    expect(atendimentoRepository.atualizar).not.toHaveBeenCalled();
  });

  it("deve registrar status anterior e data no cancelamento", async () => {
    vi.mocked(atendimentoRepository.buscarComEtapas).mockResolvedValueOnce({
      id: "atd-1",
      status: "AGUARDANDO_ORCAMENTO",
    } as never);
    vi.mocked(atendimentoRepository.atualizar).mockResolvedValueOnce({
      id: "atd-1",
      status: "ORCAMENTO_CANCELADO",
    } as never);

    await atendimentoService.cancelar("atd-1", "ORCAMENTO_CANCELADO", "usr-1");

    expect(atendimentoRepository.atualizar).toHaveBeenCalledWith(
      "atd-1",
      expect.objectContaining({
        status: "ORCAMENTO_CANCELADO",
        statusAnteriorCancelamento: "AGUARDANDO_ORCAMENTO",
        canceladoPor: "usr-1",
        canceladoEm: expect.any(Date),
      }),
    );
  });

  it("deve rejeitar status de cancelamento invalido", async () => {
    vi.mocked(atendimentoRepository.buscarComEtapas).mockResolvedValueOnce({
      id: "atd-1",
      status: "AGUARDANDO_ORCAMENTO",
    } as never);

    await expect(
      atendimentoService.cancelar("atd-1", "SERVICO_FINALIZADO", "usr-1"),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
