"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { buildQS, requestJson } from "@/hooks/http";

type OrdenacaoMotorista =
  | "NOME_ASC"
  | "NOME_DESC"
  | "CRIADO_EM_DESC"
  | "CRIADO_EM_ASC"
  | "CNH_VALIDADE_ASC"
  | "CNH_VALIDADE_DESC";

export type MotoristaListagemItem = {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  cnh: string;
  cnhCategoria: string;
  cnhValidade: string;
  ativo: boolean;
  createdAt: string;
};

export type MotoristaDetalhe = {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  cnh: string;
  cnhCategoria: string;
  cnhValidade: string;
  ativo: boolean;
  observacoes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MotoristasListagemResponse = {
  itens: MotoristaListagemItem[];
  total: number;
  pagina: number;
  tamanho: number;
  totalPaginas: number;
};

export type MotoristaFiltrosHook = {
  busca?: string;
  incluirInativos?: boolean;
  apenasComCnhValida?: boolean;
  ordenarPor?: OrdenacaoMotorista;
  pagina?: number;
  tamanho?: number;
};

export function useMotoristas(filtros: MotoristaFiltrosHook = {}) {
  return useQuery({
    queryKey: ["motoristas", filtros],
    queryFn: () =>
      requestJson<MotoristasListagemResponse>(
        `/api/motoristas?${buildQS(filtros)}`,
      ),
    staleTime: 30_000,
  });
}

export function useMotorista(id?: string) {
  return useQuery({
    queryKey: ["motorista", id],
    queryFn: () => requestJson<MotoristaDetalhe>(`/api/motoristas/${id}`),
    enabled: Boolean(id),
  });
}

export function useCriarMotorista() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: unknown) =>
      requestJson("/api/motoristas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["motoristas"] });
    },
  });
}

export function useAtualizarMotorista() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: unknown }) =>
      requestJson(`/api/motoristas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["motoristas"] });
      void queryClient.invalidateQueries({
        queryKey: ["motorista", variables.id],
      });
    },
  });
}

export function useDesativarMotorista() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      requestJson(`/api/motoristas/${id}/desativar`, { method: "POST" }),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: ["motoristas"] });
      void queryClient.invalidateQueries({ queryKey: ["motorista", id] });
    },
  });
}

export function useAtivarMotorista() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      requestJson(`/api/motoristas/${id}/ativar`, { method: "POST" }),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: ["motoristas"] });
      void queryClient.invalidateQueries({ queryKey: ["motorista", id] });
    },
  });
}

export function useExcluirMotorista() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      requestJson(`/api/motoristas/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["motoristas"] });
    },
  });
}
