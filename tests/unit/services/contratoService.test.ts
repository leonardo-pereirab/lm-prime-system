import { beforeEach, describe, expect, it, vi } from "vitest";

import { NotFoundError, ValidationError } from "@/domain/errors";
import { gerarPdfContrato } from "@/lib/pdf";
import { atendimentoRepository } from "@/repositories/atendimentoRepository";
import { contratoRepository } from "@/repositories/contratoRepository";
import { contratoService } from "@/services/contratoService";
import { put } from "@vercel/blob";

vi.mock("@vercel/blob", () => ({
  put: vi.fn(),
  get: vi.fn(),
}));

vi.mock("node:fs/promises", () => ({
  default: {
    mkdir: vi.fn(),
    readFile: vi.fn(),
    stat: vi.fn(),
    writeFile: vi.fn(),
  },
  mkdir: vi.fn(),
  readFile: vi.fn(),
  stat: vi.fn(),
  writeFile: vi.fn(),
}));

vi.mock("@/lib/pdf", () => ({
  gerarPdfContrato: vi.fn(),
}));

vi.mock("@/repositories/atendimentoRepository", () => ({
  atendimentoRepository: {
    buscarComEtapas: vi.fn(),
  },
}));

vi.mock("@/repositories/contratoRepository", () => ({
  contratoRepository: {
    criar: vi.fn(),
    listar: vi.fn(),
    listarPaginado: vi.fn(),
    listarPorAtendimento: vi.fn(),
    buscarPorAtendimento: vi.fn(),
    buscarPorId: vi.fn(),
    desativar: vi.fn(),
  },
}));

const atendimentoRepo = vi.mocked(atendimentoRepository);
const contratoRepo = vi.mocked(contratoRepository);
const pdf = vi.mocked(gerarPdfContrato);
const blobPut = vi.mocked(put);

function atendimentoCompleto(overrides = {}) {
  return {
    id: "atd-1",
    codigo: "ATD-2026-00001",
    cliente: { nome: "Maria Prime", cpfCnpj: "52998224725" },
    leadNome: null,
    dataServico: new Date("2026-07-10T12:00:00.000Z"),
    tipoServico: "VIAGEM",
    qtdPassageiros: 10,
    trajeto: [
      {
        origem: "Sao Paulo",
        destino: "Campinas",
        data: "2026-07-10",
        hora: "08:00",
      },
    ],
    reserva: { observacoes: "Reserva confirmada" },
    orcamento: {
      valorTotal: 1500,
      formaPagamento: "PIX",
      observacoes: "Orcamento aprovado",
    },
    ...overrides,
  };
}

describe("contratoService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BLOB_READ_WRITE_TOKEN = "token";
    pdf.mockResolvedValue(Buffer.from("pdf"));
    blobPut.mockResolvedValue({
      url: "https://blob.example/contrato.pdf",
    } as never);
  });

  it("gera contrato usando dados do atendimento e armazena pdf", async () => {
    atendimentoRepo.buscarComEtapas.mockResolvedValueOnce(
      atendimentoCompleto() as never,
    );
    contratoRepo.criar.mockResolvedValueOnce({ id: "contrato-1" } as never);

    await contratoService.gerar("atd-1", "usuario-1");

    expect(pdf).toHaveBeenCalledWith(
      expect.objectContaining({
        codigoAtendimento: "ATD-2026-00001",
        contratanteNome: "Maria Prime",
        contratanteDocumento: "529.982.247-25",
        valorTotal: expect.any(String),
      }),
      "contrato_maria-prime_2026-07-10.pdf",
    );
    expect(blobPut).toHaveBeenCalledWith(
      expect.stringContaining("contratos/atd-1/"),
      expect.any(Buffer),
      expect.objectContaining({
        access: "private",
        contentType: "application/pdf",
      }),
    );
    expect(contratoRepo.criar).toHaveBeenCalledWith(
      expect.objectContaining({
        atendimentoId: "atd-1",
        nomeArquivo: "contrato_maria-prime_2026-07-10.pdf",
        pdfUrl: "https://blob.example/contrato.pdf",
        geradoPor: "usuario-1",
      }),
    );
  });

  it("bloqueia geracao sem usuario, atendimento, reserva ou orcamento", async () => {
    await expect(contratoService.gerar("atd-1")).rejects.toBeInstanceOf(
      ValidationError,
    );

    atendimentoRepo.buscarComEtapas.mockResolvedValueOnce(null);
    await expect(
      contratoService.gerar("atd-1", "usuario-1"),
    ).rejects.toBeInstanceOf(NotFoundError);

    atendimentoRepo.buscarComEtapas.mockResolvedValueOnce(
      atendimentoCompleto({ reserva: null }) as never,
    );
    await expect(
      contratoService.gerar("atd-1", "usuario-1"),
    ).rejects.toBeInstanceOf(ValidationError);

    atendimentoRepo.buscarComEtapas.mockResolvedValueOnce(
      atendimentoCompleto({ orcamento: null }) as never,
    );
    await expect(
      contratoService.gerar("atd-1", "usuario-1"),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("retorna download url somente para contrato ativo com arquivo", async () => {
    contratoRepo.buscarPorId.mockResolvedValueOnce({
      id: "contrato-1",
      ativo: true,
      pdfUrl: "https://blob.example/contrato.pdf",
    } as never);

    await expect(contratoService.obterDownloadUrl("contrato-1")).resolves.toBe(
      "https://blob.example/contrato.pdf",
    );

    contratoRepo.buscarPorId.mockResolvedValueOnce({
      id: "contrato-1",
      ativo: true,
      pdfUrl: null,
    } as never);
    await expect(
      contratoService.obterDownloadUrl("contrato-1"),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("desativa contrato existente", async () => {
    contratoRepo.buscarPorId.mockResolvedValueOnce({
      id: "contrato-1",
    } as never);

    await contratoService.desativar("contrato-1");

    expect(contratoRepo.desativar).toHaveBeenCalledWith("contrato-1");
  });
});
