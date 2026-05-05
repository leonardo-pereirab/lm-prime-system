"use client";

import { useEffect, useState } from "react";

export function useEscala() {
  const [escalas, setEscalas] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/escala")
      .then((res) => res.json())
      .then((data) => setEscalas(data))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Erro inesperado");
      })
      .finally(() => setLoading(false));
  }, []);

  return { escalas, loading, error };
}
