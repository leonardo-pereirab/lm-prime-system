"use client";

import { useEffect, useState } from "react";

export function useVeiculos() {
  const [veiculos, setVeiculos] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/veiculos")
      .then((res) => res.json())
      .then((data) => setVeiculos(data))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Erro inesperado");
      })
      .finally(() => setLoading(false));
  }, []);

  return { veiculos, loading, error };
}
