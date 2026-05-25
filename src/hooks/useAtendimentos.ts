"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { StatusAtendimento, TipoServico } from "@prisma/client";
import { buildQS, requestJson } from "@/hooks/http";

export type AtendimentoListagemItem = {
  id: string;
  codigo: string | null;
  status: StatusAtendimento;
  dataContato: string;
  dataServico: string | null;
  tipoServico: TipoServico;
  qtdPassageiros: number;
  clienteId: string | null;
  leadNome: string | null;
  leadTelefone: string | null;
  createdAt: string;
  cliente: {
    id: string;
    nome: string;
    cpfCnpj: string;
  } | null;
};

export type AtendimentoFiltrosHook = {
  busca?: string;
  status?: StatusAtendimento;
  clienteId?: string;
  dataInicio?: string;
  dataFim?: string;
  pagina?: number;
  tamanho?: number;
};

export type AtendimentosListagemResponse = {
  itens: AtendimentoListagemItem[];
  total: number;
  pagina: number;
  tamanho: number;
  totalPaginas: number;
};

export function useAtendimentos(filtros: AtendimentoFiltrosHook = {}) {
  return useQuery({
    queryKey: ["atendimentos", filtros],
    queryFn: () =>
      requestJson<AtendimentosListagemResponse>(
        `/api/atendimentos?${buildQS(filtros)}`,
      ),
    staleTime: 30_000,
  });
}

export function useAtendimento(id?: string) {
  return useQuery({
    queryKey: ["atendimento", id],
    queryFn: () => requestJson(`/api/atendimentos/${id}`),
    enabled: Boolean(id),
  });
}

export function useCriarAtendimento() {
  return useMutation({
    mutationFn: (payload: unknown) =>
      requestJson("/api/atendimentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
  });
}

export function useAvancarAtendimento() {
  return useMutation({
    mutationFn: ({ id, para }: { id: string; para: string }) =>
      requestJson(`/api/atendimentos/${id}/avancar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ para }),
      }),
  });
}

export function useCancelarAtendimento() {
  return useMutation({
    mutationFn: ({ id, etapa }: { id: string; etapa: string }) =>
      requestJson(`/api/atendimentos/${id}/cancelar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ etapa }),
      }),
  });
}
