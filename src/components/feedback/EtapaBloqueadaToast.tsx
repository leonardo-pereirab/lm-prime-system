"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function EtapaBloqueadaToast() {
  const searchParams = useSearchParams();
  const ultimoAviso = useRef<string | null>(null);

  useEffect(() => {
    const aviso = searchParams.get("aviso");

    if (!aviso || aviso === ultimoAviso.current) {
      return;
    }

    if (aviso === "etapa-bloqueada") {
      toast.info("Etapa ainda nao disponivel para o status atual.");
    }

    ultimoAviso.current = aviso;
  }, [searchParams]);

  return null;
}
