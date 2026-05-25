"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { buildQS, requestJson } from "@/hooks/http";

export function useEscala(filtros: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ["escala", filtros],
    queryFn: () => requestJson(`/api/escala?${buildQS(filtros)}`),
    staleTime: 30_000,
  });
}

export function useEscalaAtendimento(id?: string) {
  return useQuery({
    queryKey: ["escala-atendimento", id],
    queryFn: () => requestJson(`/api/escala/${id}`),
    enabled: Boolean(id),
  });
}

export function useDefinirEscala() {
  return useMutation({
    mutationFn: (payload: unknown) =>
      requestJson("/api/escala", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
  });
}

export function useAtualizarEscala() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: unknown }) =>
      requestJson(`/api/escala/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
  });
}
