"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  ClassificacaoFuncionario,
  EstadoFuncionario,
  PerfilUsuario,
} from "@prisma/client";
import { buildQS, requestJson } from "@/hooks/http";

type OrdenacaoFuncionario =
  | "NOME_ASC"
  | "NOME_DESC"
  | "CRIADO_EM_DESC"
  | "CRIADO_EM_ASC";

export type FuncionarioListagemItem = {
  id: string;
  usuarioId: string | null;
  estado: EstadoFuncionario;
  classificacao: ClassificacaoFuncionario;
  matricula: string;
  nomeCompleto: string;
  emailCorporativo: string;
  cpf: string;
  telefonePrincipal: string;
  telefoneAdicional: string | null;
  cidade: string;
  estadoUf: string;
  anonimizadoEm: string | null;
  createdAt: string;
  usuario: {
    id: string;
    perfil: PerfilUsuario;
    ativo: boolean;
  } | null;
};

export type FuncionarioDetalhe = {
  id: string;
  usuarioId: string | null;
  estado: EstadoFuncionario;
  classificacao: ClassificacaoFuncionario;
  matricula: string;
  nomeCompleto: string;
  emailCorporativo: string;
  cpf: string;
  telefonePrincipal: string;
  telefoneAdicional: string | null;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  estadoUf: string;
  aceitouTermosEm: string | null;
  versaoTermosAceita: string | null;
  anonimizadoEm: string | null;
  createdAt: string;
  updatedAt: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    perfil: PerfilUsuario;
    ativo: boolean;
    createdAt: string;
    updatedAt: string;
  } | null;
};

export type FuncionariosListagemResponse = {
  itens: FuncionarioListagemItem[];
  total: number;
  pagina: number;
  tamanho: number;
  totalPaginas: number;
};

export type FuncionarioFiltrosHook = {
  busca?: string;
  estado?: EstadoFuncionario;
  classificacao?: ClassificacaoFuncionario;
  ordenarPor?: OrdenacaoFuncionario;
  pagina?: number;
  tamanho?: number;
};

export function useFuncionarios(filtros: FuncionarioFiltrosHook = {}) {
  return useQuery({
    queryKey: ["funcionarios", filtros],
    queryFn: () =>
      requestJson<FuncionariosListagemResponse>(
        `/api/funcionarios?${buildQS(filtros)}`,
      ),
    staleTime: 30_000,
  });
}

export function useFuncionario(id: string) {
  return useQuery({
    queryKey: ["funcionario", id],
    queryFn: () => requestJson<FuncionarioDetalhe>(`/api/funcionarios/${id}`),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}
