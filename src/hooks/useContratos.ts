"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { buildQS, requestJson } from "@/hooks/http";

export function useContratos(filtros: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ["contratos", filtros],
    queryFn: () => requestJson(`/api/contratos?${buildQS(filtros)}`),
    staleTime: 30_000,
  });
}

export function useContratoPorAtendimento(atendimentoId?: string) {
  return useQuery({
    queryKey: ["contrato-atendimento", atendimentoId],
    queryFn: () => requestJson(`/api/contratos/${atendimentoId}`),
    enabled: Boolean(atendimentoId),
  });
}

export function useGerarContrato() {
  return useMutation({
    mutationFn: ({ atendimentoId }: { atendimentoId: string }) =>
      requestJson("/api/contratos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ atendimentoId }),
      }),
  });
}

export function useExcluirContrato() {
  return useMutation({
    mutationFn: (id: string) =>
      requestJson(`/api/contratos/${id}`, { method: "DELETE" }),
  });
}
