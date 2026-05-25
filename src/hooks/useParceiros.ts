"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { buildQS, requestJson } from "@/hooks/http";

type OrdenacaoParceiro =
  | "NOME_ASC"
  | "NOME_DESC"
  | "CRIADO_EM_DESC"
  | "CRIADO_EM_ASC";

export type ParceiroListagemItem = {
  id: string;
  nome: string;
  cnpj: string;
  telefone: string;
  cidade: string | null;
  estado: string | null;
  ativo: boolean;
  createdAt: string;
};

export type ParceiroDetalhe = {
  id: string;
  nome: string;
  cnpj: string;
  telefone: string;
  email: string | null;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  ativo: boolean;
  observacoes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ParceirosListagemResponse = {
  itens: ParceiroListagemItem[];
  total: number;
  pagina: number;
  tamanho: number;
  totalPaginas: number;
};

export type ParceiroFiltrosHook = {
  busca?: string;
  incluirInativos?: boolean;
  ordenarPor?: OrdenacaoParceiro;
  pagina?: number;
  tamanho?: number;
};

export function useParceiros(filtros: ParceiroFiltrosHook = {}) {
  return useQuery({
    queryKey: ["parceiros", filtros],
    queryFn: () =>
      requestJson<ParceirosListagemResponse>(
        `/api/parceiros?${buildQS(filtros)}`,
      ),
    staleTime: 30_000,
  });
}

export function useParceiro(id?: string) {
  return useQuery({
    queryKey: ["parceiro", id],
    queryFn: () => requestJson<ParceiroDetalhe>(`/api/parceiros/${id}`),
    enabled: Boolean(id),
  });
}

export function useCriarParceiro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: unknown) =>
      requestJson("/api/parceiros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["parceiros"] });
    },
  });
}

export function useAtualizarParceiro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: unknown }) =>
      requestJson(`/api/parceiros/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["parceiros"] });
      void queryClient.invalidateQueries({
        queryKey: ["parceiro", variables.id],
      });
    },
  });
}

export function useDesativarParceiro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      requestJson(`/api/parceiros/${id}/desativar`, { method: "POST" }),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: ["parceiros"] });
      void queryClient.invalidateQueries({ queryKey: ["parceiro", id] });
    },
  });
}

export function useAtivarParceiro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      requestJson(`/api/parceiros/${id}/ativar`, { method: "POST" }),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: ["parceiros"] });
      void queryClient.invalidateQueries({ queryKey: ["parceiro", id] });
    },
  });
}

export function useExcluirParceiro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      requestJson(`/api/parceiros/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["parceiros"] });
    },
  });
}
