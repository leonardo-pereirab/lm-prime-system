import { beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "@/lib/prisma";
import { dashboardService } from "@/services/dashboardService";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    atendimento: {
      count: vi.fn(),
      groupBy: vi.fn(),
      findMany: vi.fn(),
    },
    escalaMotorista: {
      groupBy: vi.fn(),
    },
    motorista: {
      findMany: vi.fn(),
    },
    escalaVeiculo: {
      groupBy: vi.fn(),
    },
    veiculo: {
      findMany: vi.fn(),
    },
    escalaParceiro: {
      groupBy: vi.fn(),
    },
    parceiro: {
      findMany: vi.fn(),
    },
  },
}));

const prismaMock = vi.mocked(prisma);
const periodo = {
  inicio: new Date("2026-06-01"),
  fim: new Date("2026-06-30"),
  preset: "custom" as const,
};
const atendimentoCount = prismaMock.atendimento.count as unknown as ReturnType<
  typeof vi.fn
>;
const atendimentoGroupBy = prismaMock.atendimento
  .groupBy as unknown as ReturnType<typeof vi.fn>;
const atendimentoFindMany = prismaMock.atendimento
  .findMany as unknown as ReturnType<typeof vi.fn>;
const escalaMotoristaGroupBy = prismaMock.escalaMotorista
  .groupBy as unknown as ReturnType<typeof vi.fn>;
const motoristaFindMany = prismaMock.motorista
  .findMany as unknown as ReturnType<typeof vi.fn>;
const escalaVeiculoGroupBy = prismaMock.escalaVeiculo
  .groupBy as unknown as ReturnType<typeof vi.fn>;
const veiculoFindMany = prismaMock.veiculo.findMany as unknown as ReturnType<
  typeof vi.fn
>;
const escalaParceiroGroupBy = prismaMock.escalaParceiro
  .groupBy as unknown as ReturnType<typeof vi.fn>;
const parceiroFindMany = prismaMock.parceiro.findMany as unknown as ReturnType<
  typeof vi.fn
>;

describe("dashboardService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calcula indicadores e conversoes do periodo", async () => {
    atendimentoCount
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(8)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(2);
    atendimentoGroupBy.mockResolvedValueOnce([
      {
        statusAnteriorCancelamento: "AGUARDANDO_ORCAMENTO",
        _count: { _all: 2 },
      },
    ]);
    atendimentoFindMany.mockResolvedValueOnce([{ id: "atd-1" }]);

    const topMotoristas = vi
      .spyOn(dashboardService, "topMotoristas")
      .mockResolvedValueOnce([{ id: "m1", nome: "Motorista", total: 2 }]);
    const topVeiculos = vi
      .spyOn(dashboardService, "topVeiculos")
      .mockResolvedValueOnce([{ id: "v1", nome: "Van (ABC1234)", total: 1 }]);
    const topParceiros = vi
      .spyOn(dashboardService, "topParceiros")
      .mockResolvedValueOnce([{ id: "p1", nome: "Parceiro", total: 1 }]);

    const resultado = await dashboardService.obterIndicadores(periodo);

    expect(resultado.totalAtendimentos).toBe(10);
    expect(resultado.totais).toEqual({
      abertos: 4,
      finalizados: 3,
      cancelados: 2,
    });
    expect(resultado.conversoes).toEqual({
      atendimentoParaServico: 0.3,
      solicitacaoParaOrcamento: 0.8,
      orcamentoParaReserva: 0.625,
      reservaParaServico: 0.6,
    });
    expect(resultado.cancelamentosPorEtapa).toEqual([
      { etapa: "AGUARDANDO_ORCAMENTO", total: 2 },
    ]);
    expect(topMotoristas).toHaveBeenCalledWith(periodo);
    expect(topVeiculos).toHaveBeenCalledWith(periodo);
    expect(topParceiros).toHaveBeenCalledWith(periodo);
  });

  it("retorna conversoes zeradas quando nao ha registros", async () => {
    atendimentoCount.mockResolvedValue(0);
    atendimentoGroupBy.mockResolvedValueOnce([]);
    atendimentoFindMany.mockResolvedValueOnce([]);
    vi.spyOn(dashboardService, "topMotoristas").mockResolvedValueOnce([]);
    vi.spyOn(dashboardService, "topVeiculos").mockResolvedValueOnce([]);
    vi.spyOn(dashboardService, "topParceiros").mockResolvedValueOnce([]);

    const resultado = await dashboardService.obterIndicadores(periodo);

    expect(resultado.conversoes).toEqual({
      atendimentoParaServico: 0,
      solicitacaoParaOrcamento: 0,
      orcamentoParaReserva: 0,
      reservaParaServico: 0,
    });
  });

  it("monta ranking de motoristas com fallback para removidos", async () => {
    escalaMotoristaGroupBy.mockResolvedValueOnce([
      { motoristaId: "m1", _count: { _all: 3 } },
      { motoristaId: "m2", _count: { _all: 1 } },
    ]);
    motoristaFindMany.mockResolvedValueOnce([{ id: "m1", nome: "Ana" }]);

    await expect(dashboardService.topMotoristas(periodo)).resolves.toEqual([
      { id: "m1", nome: "Ana", total: 3 },
      { id: "m2", nome: "Motorista removido", total: 1 },
    ]);
  });

  it("monta ranking de veiculos e parceiros", async () => {
    escalaVeiculoGroupBy.mockResolvedValueOnce([
      { veiculoId: "v1", _count: { _all: 2 } },
    ]);
    veiculoFindMany.mockResolvedValueOnce([
      { id: "v1", modelo: "Sprinter", placa: "ABC1234" },
    ]);
    escalaParceiroGroupBy.mockResolvedValueOnce([
      { parceiroId: "p1", _count: { _all: 4 } },
    ]);
    parceiroFindMany.mockResolvedValueOnce([{ id: "p1", nome: "Parceiro" }]);

    await expect(dashboardService.topVeiculos(periodo)).resolves.toEqual([
      { id: "v1", nome: "Sprinter (ABC1234)", total: 2 },
    ]);
    await expect(dashboardService.topParceiros(periodo)).resolves.toEqual([
      { id: "p1", nome: "Parceiro", total: 4 },
    ]);
  });
});
