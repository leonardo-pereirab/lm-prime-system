"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { buildQS, requestJson } from "@/hooks/http";

type OrdenacaoVeiculo =
  | "MODELO_ASC"
  | "MODELO_DESC"
  | "PLACA_ASC"
  | "PLACA_DESC"
  | "CAPACIDADE_ASC"
  | "CAPACIDADE_DESC"
  | "CRIADO_EM_DESC"
  | "CRIADO_EM_ASC";

export type VeiculoListagemItem = {
  id: string;
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  capacidade: number;
  tipo: string;
  ativo: boolean;
  observacoes: string | null;
  createdAt: string;
};

export type VeiculoDetalhe = {
  id: string;
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  capacidade: number;
  tipo: string;
  ativo: boolean;
  observacoes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type VeiculosListagemResponse = {
  itens: VeiculoListagemItem[];
  total: number;
  pagina: number;
  tamanho: number;
  totalPaginas: number;
};

export type VeiculoFiltrosHook = {
  busca?: string;
  tipo?: string;
  incluirInativos?: boolean;
  ordenarPor?: OrdenacaoVeiculo;
  pagina?: number;
  tamanho?: number;
};

export function useVeiculos(filtros: VeiculoFiltrosHook = {}) {
  return useQuery({
    queryKey: ["veiculos", filtros],
    queryFn: () =>
      requestJson<VeiculosListagemResponse>(
        `/api/veiculos?${buildQS(filtros)}`,
      ),
    staleTime: 30_000,
  });
}

export function useVeiculo(id?: string) {
  return useQuery({
    queryKey: ["veiculo", id],
    queryFn: () => requestJson<VeiculoDetalhe>(`/api/veiculos/${id}`),
    enabled: Boolean(id),
  });
}

export function useCriarVeiculo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: unknown) =>
      requestJson("/api/veiculos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["veiculos"] });
    },
  });
}

export function useAtualizarVeiculo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: unknown }) =>
      requestJson(`/api/veiculos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["veiculos"] });
      void queryClient.invalidateQueries({
        queryKey: ["veiculo", variables.id],
      });
    },
  });
}

export function useDesativarVeiculo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      requestJson(`/api/veiculos/${id}/desativar`, { method: "POST" }),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: ["veiculos"] });
      void queryClient.invalidateQueries({ queryKey: ["veiculo", id] });
    },
  });
}

export function useAtivarVeiculo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      requestJson(`/api/veiculos/${id}/ativar`, { method: "POST" }),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: ["veiculos"] });
      void queryClient.invalidateQueries({ queryKey: ["veiculo", id] });
    },
  });
}

export function useExcluirVeiculo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      requestJson(`/api/veiculos/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["veiculos"] });
    },
  });
}
