"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { buildQS, requestJson } from "@/hooks/http";

export function useOrcamentos(filtros: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ["orcamentos", filtros],
    queryFn: () => requestJson(`/api/orcamentos?${buildQS(filtros)}`),
    staleTime: 30_000,
  });
}

export function useOrcamento(id?: string) {
  return useQuery({
    queryKey: ["orcamento", id],
    queryFn: () => requestJson(`/api/orcamentos/${id}`),
    enabled: Boolean(id),
  });
}

export function useCriarOrcamento() {
  return useMutation({
    mutationFn: (payload: unknown) =>
      requestJson("/api/orcamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
  });
}

export function useAtualizarOrcamento() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: unknown }) =>
      requestJson(`/api/orcamentos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
  });
}

export function useCancelarOrcamento() {
  return useMutation({
    mutationFn: (id: string) =>
      requestJson(`/api/orcamentos/${id}`, { method: "DELETE" }),
  });
}
