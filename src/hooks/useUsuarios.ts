"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { buildQS, requestJson } from "@/hooks/http";

export function useUsuarios(filtros: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ["usuarios", filtros],
    queryFn: () => requestJson(`/api/usuarios?${buildQS(filtros)}`),
    staleTime: 30_000,
  });
}

export function useUsuario(id?: string) {
  return useQuery({
    queryKey: ["usuario", id],
    queryFn: () => requestJson(`/api/usuarios/${id}`),
    enabled: Boolean(id),
  });
}

export function useCriarUsuario() {
  return useMutation({
    mutationFn: (payload: unknown) =>
      requestJson("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
  });
}

export function useAtualizarUsuario() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: unknown }) =>
      requestJson(`/api/usuarios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
  });
}

export function useDesativarUsuario() {
  return useMutation({
    mutationFn: (id: string) =>
      requestJson(`/api/usuarios/${id}/desativar`, { method: "POST" }),
  });
}

export function useExcluirUsuario() {
  return useMutation({
    mutationFn: (id: string) =>
      requestJson(`/api/usuarios/${id}`, { method: "DELETE" }),
  });
}
