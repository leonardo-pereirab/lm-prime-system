"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { buildQS, requestJson } from "@/hooks/http";

export function useReservas(filtros: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ["reservas", filtros],
    queryFn: () => requestJson(`/api/reservas?${buildQS(filtros)}`),
    staleTime: 30_000,
  });
}

export function useReserva(id?: string) {
  return useQuery({
    queryKey: ["reserva", id],
    queryFn: () => requestJson(`/api/reservas/${id}`),
    enabled: Boolean(id),
  });
}

export function useCriarReserva() {
  return useMutation({
    mutationFn: (payload: unknown) =>
      requestJson("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
  });
}

export function useAtualizarReserva() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: unknown }) =>
      requestJson(`/api/reservas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
  });
}

export function useCancelarReserva() {
  return useMutation({
    mutationFn: (id: string) =>
      requestJson(`/api/reservas/${id}`, { method: "DELETE" }),
  });
}
