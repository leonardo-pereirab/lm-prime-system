"use client";

import { useQuery } from "@tanstack/react-query";
import { buildQS, requestJson } from "@/hooks/http";

export type DashboardFiltroHook = {
  periodo?: "7d" | "30d" | "90d" | "mes-atual" | "custom";
  dataInicio?: string;
  dataFim?: string;
};

export type DashboardTopItem = {
  id: string;
  nome: string;
  total: number;
};

export type DashboardHistoricoServico = {
  id: string;
  codigo: string | null;
  dataServico: Date | string | null;
  updatedAt: Date | string;
  cliente: {
    id: string;
    nome: string;
    cpfCnpj: string;
  } | null;
  leadNome: string | null;
};

export type DashboardIndicadores = {
  totalAtendimentos: number;
  totais: {
    abertos: number;
    finalizados: number;
    cancelados: number;
  };
  totalSolicitacoes: number;
  totalOrcamentos: number;
  totalReservas: number;
  totalServicos: number;
  cancelamentos: number;
  conversoes: {
    atendimentoParaServico: number;
    solicitacaoParaOrcamento: number;
    orcamentoParaReserva: number;
    reservaParaServico: number;
  };
  cancelamentosPorEtapa: Array<{
    etapa: string | null;
    total: number;
  }>;
  topRecursos: {
    motoristas: DashboardTopItem[];
    veiculos: DashboardTopItem[];
    parceiros: DashboardTopItem[];
  };
  historicoServicos: DashboardHistoricoServico[];
};

export function useDashboard(filtros: DashboardFiltroHook) {
  return useQuery({
    queryKey: ["dashboard", filtros],
    queryFn: () =>
      requestJson<DashboardIndicadores>(
        `/api/dashboard/indicadores?${buildQS(filtros)}`,
      ),
    staleTime: 30_000,
  });
}
