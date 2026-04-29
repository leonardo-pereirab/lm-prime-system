"use client";

import { useEffect, useState } from "react";

export function useClientes() {
  const [clientes, setClientes] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/clientes")
      .then((res) => res.json())
      .then((data) => setClientes(data))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Erro inesperado");
      })
      .finally(() => setLoading(false));
  }, []);

  return { clientes, loading, error };
}
