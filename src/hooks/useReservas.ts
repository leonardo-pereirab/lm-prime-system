"use client";

import { useEffect, useState } from "react";

export function useReservas() {
  const [reservas, setReservas] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/reservas")
      .then((res) => res.json())
      .then((data) => setReservas(data))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Erro inesperado");
      })
      .finally(() => setLoading(false));
  }, []);

  return { reservas, loading, error };
}
