"use client";

import { useCallback, useEffect, useState } from "react";
import type { Cliente } from "@prisma/client";

type DadosCliente = {
  nome: string;
  cpfCnpj: string;
  rgIe?: string | null;
  telefone: string;
  email?: string | null;
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
  ativo?: boolean;
};

async function parseErroResposta(res: Response): Promise<string> {
  try {
    const corpo = (await res.json()) as { erro?: string; error?: string };
    return corpo.erro ?? corpo.error ?? "Erro inesperado na operacao.";
  } catch {
    return "Erro inesperado na operacao.";
  }
}

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erroCrud, setErroCrud] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const resposta = await fetch("/api/clientes");
      if (!resposta.ok) {
        throw new Error(await parseErroResposta(resposta));
      }

      const data = (await resposta.json()) as Cliente[];
      setClientes(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }, []);

  const criar = useCallback(
    async (dados: DadosCliente) => {
      setSalvando(true);
      setErroCrud(null);

      try {
        const resposta = await fetch("/api/clientes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dados),
        });

        if (!resposta.ok) {
          throw new Error(await parseErroResposta(resposta));
        }

        await recarregar();
      } catch (err: unknown) {
        const mensagem =
          err instanceof Error ? err.message : "Erro inesperado ao criar cliente.";
        setErroCrud(mensagem);
        throw new Error(mensagem);
      } finally {
        setSalvando(false);
      }
    },
    [recarregar],
  );

  const atualizar = useCallback(
    async (id: string, dados: Partial<DadosCliente>) => {
      setSalvando(true);
      setErroCrud(null);

      try {
        const resposta = await fetch(`/api/clientes/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dados),
        });

        if (!resposta.ok) {
          throw new Error(await parseErroResposta(resposta));
        }

        await recarregar();
      } catch (err: unknown) {
        const mensagem =
          err instanceof Error
            ? err.message
            : "Erro inesperado ao atualizar cliente.";
        setErroCrud(mensagem);
        throw new Error(mensagem);
      } finally {
        setSalvando(false);
      }
    },
    [recarregar],
  );

  const desativar = useCallback(
    async (id: string) => {
      await atualizar(id, { ativo: false });
    },
    [atualizar],
  );

  const reativar = useCallback(
    async (id: string) => {
      await atualizar(id, { ativo: true });
    },
    [atualizar],
  );

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  return {
    clientes,
    loading,
    error,
    salvando,
    erroCrud,
    recarregar,
    criar,
    atualizar,
    desativar,
    reativar,
  };
}
