"use client";

import { differenceInMinutes } from "date-fns";
import { useEffect, useMemo, useState } from "react";

type CountdownValidadeProps = {
  validoAte: Date | string;
  onExpiradoChange?: (expirado: boolean) => void;
};

type CountdownEstado = {
  texto: string;
  expirado: boolean;
  variante: "info" | "warning" | "danger";
};

function calcularEstado(validoAte: Date, agora: Date): CountdownEstado {
  const minutosRestantes = differenceInMinutes(validoAte, agora);

  if (minutosRestantes <= 0) {
    return {
      texto: "Vencido",
      expirado: true,
      variante: "danger",
    };
  }

  const dias = Math.floor(minutosRestantes / (60 * 24));
  const horas = Math.floor((minutosRestantes % (60 * 24)) / 60);
  const minutos = minutosRestantes % 60;

  const texto =
    dias >= 1
      ? `Valido por ${dias}d ${horas}h`
      : `Valido por ${horas}h ${minutos}m`;

  if (minutosRestantes <= 60) {
    return { texto, expirado: false, variante: "danger" };
  }

  if (minutosRestantes <= 24 * 60) {
    return { texto, expirado: false, variante: "warning" };
  }

  return { texto, expirado: false, variante: "info" };
}

const CLASSE_VARIANTE = {
  info: "border-info-600/30 bg-info-600/10 text-info-600",
  warning: "border-warning-600/30 bg-warning-600/10 text-warning-600",
  danger: "border-danger-600/30 bg-danger-600/10 text-danger-600",
} as const;

export default function CountdownValidade({
  validoAte,
  onExpiradoChange,
}: CountdownValidadeProps) {
  const [agora, setAgora] = useState(() => new Date());

  const dataValidade = useMemo(() => {
    return validoAte instanceof Date ? validoAte : new Date(validoAte);
  }, [validoAte]);

  const estado = useMemo(() => {
    if (Number.isNaN(dataValidade.getTime())) {
      return {
        texto: "Validade indisponivel",
        expirado: true,
        variante: "danger",
      } satisfies CountdownEstado;
    }

    return calcularEstado(dataValidade, agora);
  }, [agora, dataValidade]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setAgora(new Date());
    }, 60_000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    onExpiradoChange?.(estado.expirado);
  }, [estado.expirado, onExpiradoChange]);

  return (
    <div
      className={`rounded-md border px-3 py-2 text-sm font-medium ${CLASSE_VARIANTE[estado.variante]}`}
    >
      {estado.texto}
    </div>
  );
}
