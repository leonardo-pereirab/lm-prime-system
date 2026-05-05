"use client";

import { useEffect, useState } from "react";

export function useMotoristas() {
  const [motoristas, setMotoristas] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/motoristas")
      .then((res) => res.json())
      .then((data) => setMotoristas(data))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Erro inesperado");
      })
      .finally(() => setLoading(false));
  }, []);

  return { motoristas, loading, error };
}
