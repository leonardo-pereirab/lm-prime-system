"use client";

import { useEffect, useState } from "react";

export function useAtendimentos() {
  const [atendimentos, setAtendimentos] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/atendimentos")
      .then((res) => res.json())
      .then((data) => setAtendimentos(data))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Erro inesperado");
      })
      .finally(() => setLoading(false));
  }, []);

  return { atendimentos, loading, error };
}
