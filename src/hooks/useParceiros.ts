"use client";

import { useEffect, useState } from "react";

export function useParceiros() {
  const [parceiros, setParceiros] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/parceiros")
      .then((res) => res.json())
      .then((data) => setParceiros(data))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Erro inesperado");
      })
      .finally(() => setLoading(false));
  }, []);

  return { parceiros, loading, error };
}
