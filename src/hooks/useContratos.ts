"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { buildQS, requestJson } from "@/hooks/http";
import { arquivarContrato } from "@/app/(admin)/contratos/_actions";

export type ContratoListagemItem = {
  id: string;
  atendimentoId: string;
  pdfUrl: string | null;
  geradoEm: string;
  ativo: boolean;
  atendimento: {
    id: string;
    codigo: string | null;
    dataServico: string | null;
    cliente: {
      id: string;
      nome: string;
      cpfCnpj: string;
    } | null;
  };
  geradoPorUsuario: {
    id: string;
    nome: string;
    email: string;
  } | null;
};

export type ContratoFiltrosHook = {
  clienteId?: string;
  periodoInicio?: string;
  periodoFim?: string;
  incluirInativos?: boolean;
  pagina?: number;
  tamanho?: number;
};

export type ContratosListagemResponse = {
  itens: ContratoListagemItem[];
  total: number;
  pagina: number;
  tamanho: number;
  totalPaginas: number;
};

export function useContratos(filtros: ContratoFiltrosHook = {}) {
  return useQuery({
    queryKey: ["contratos", filtros],
    queryFn: () =>
      requestJson<ContratosListagemResponse>(
        `/api/contratos?${buildQS(filtros)}`,
      ),
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

export function useArquivarContrato() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => arquivarContrato(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["contratos"] });
    },
  });
}

export function useExcluirContrato() {
  return useMutation({
    mutationFn: (id: string) =>
      requestJson(`/api/contratos/${id}`, { method: "DELETE" }),
  });
}
