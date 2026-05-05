"use client";

import { useEffect, useState } from "react";

export function useContratos() {
  const [contratos, setContratos] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/contratos")
      .then((res) => res.json())
      .then((data) => setContratos(data))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Erro inesperado");
      })
      .finally(() => setLoading(false));
  }, []);

  return { contratos, loading, error };
}
