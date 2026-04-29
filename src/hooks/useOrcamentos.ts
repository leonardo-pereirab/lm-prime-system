"use client";

import { useEffect, useState } from "react";

export function useOrcamentos() {
  const [orcamentos, setOrcamentos] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/orcamentos")
      .then((res) => res.json())
      .then((data) => setOrcamentos(data))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Erro inesperado");
      })
      .finally(() => setLoading(false));
  }, []);

  return { orcamentos, loading, error };
}
