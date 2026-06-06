"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { StatusAtendimento } from "@prisma/client";
import { buildQS, requestJson } from "@/hooks/http";

type OrdenacaoCliente =
  | "NOME_ASC"
  | "NOME_DESC"
  | "CRIADO_EM_DESC"
  | "CRIADO_EM_ASC";

export type ClienteListagemItem = {
  id: string;
  nome: string;
  cpfCnpj: string;
  telefone: string;
  cidade: string | null;
  estado: string | null;
  ativo: boolean;
  anonimizadoEm: string | null;
  createdAt: string;
};

export type ClienteDetalhe = {
  id: string;
  nome: string;
  cpfCnpj: string;
  rgIe: string | null;
  telefone: string;
  telefoneSec: string | null;
  email: string | null;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  ativo: boolean;
  anonimizadoEm: string | null;
  observacoes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ClienteExclusaoResultado = {
  modo: "EXCLUIDO" | "ANONIMIZADO";
};

export type ClienteResumoAtendimento = {
  id: string;
  codigo: string | null;
  status: StatusAtendimento;
  dataServico: string | null;
  createdAt: string;
};

export type ClientesListagemResponse = {
  itens: ClienteListagemItem[];
  total: number;
  pagina: number;
  tamanho: number;
  totalPaginas: number;
};

export type ClienteFiltrosHook = {
  busca?: string;
  incluirInativos?: boolean;
  ordenarPor?: OrdenacaoCliente;
  pagina?: number;
  tamanho?: number;
};

export function useClientes(filtros: ClienteFiltrosHook = {}) {
  return useQuery({
    queryKey: ["clientes", filtros],
    queryFn: () =>
      requestJson<ClientesListagemResponse>(
        `/api/clientes?${buildQS(filtros)}`,
      ),
    staleTime: 30_000,
  });
}

export function useCliente(id?: string) {
  return useQuery({
    queryKey: ["cliente", id],
    queryFn: () => requestJson<ClienteDetalhe>(`/api/clientes/${id}`),
    enabled: Boolean(id),
  });
}

export function useCriarCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: unknown) =>
      requestJson("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["clientes"] });
    },
  });
}

export function useAtualizarCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: unknown }) =>
      requestJson(`/api/clientes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["clientes"] });
      void queryClient.invalidateQueries({
        queryKey: ["cliente", variables.id],
      });
    },
  });
}

export function useDesativarCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      requestJson(`/api/clientes/${id}/desativar`, {
        method: "POST",
      }),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: ["clientes"] });
      void queryClient.invalidateQueries({ queryKey: ["cliente", id] });
    },
  });
}

export function useAtivarCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      requestJson(`/api/clientes/${id}/ativar`, {
        method: "POST",
      }),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: ["clientes"] });
      void queryClient.invalidateQueries({ queryKey: ["cliente", id] });
    },
  });
}

export function useExcluirCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      requestJson<ClienteExclusaoResultado>(`/api/clientes/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["clientes"] });
    },
  });
}

export function useAtendimentosDoCliente(id?: string) {
  return useQuery({
    queryKey: ["cliente-atendimentos", id],
    queryFn: () =>
      requestJson<ClienteResumoAtendimento[]>(
        `/api/clientes/${id}/atendimentos`,
      ),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}
