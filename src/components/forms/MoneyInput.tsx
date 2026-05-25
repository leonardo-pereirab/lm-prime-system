"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, ComponentProps } from "react";

import { apenasDigitos } from "@/domain/helpers";
import { Input } from "@/components/ui/Input";

type MoneyInputProps = Omit<
  ComponentProps<typeof Input>,
  "type" | "value" | "defaultValue" | "onChange"
> & {
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (valor: number | null) => void;
};

function formatarMoeda(valor: number | null) {
  if (valor === null || Number.isNaN(valor)) {
    return "";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

export function MoneyInput({
  value,
  defaultValue = null,
  onValueChange,
  ...props
}: MoneyInputProps) {
  const controlado = value !== undefined;
  const [valorInterno, setValorInterno] = useState<number | null>(defaultValue);
  const valorAtual = controlado ? (value ?? null) : valorInterno;
  const [texto, setTexto] = useState(formatarMoeda(valorAtual));

  useEffect(() => {
    setTexto(formatarMoeda(valorAtual));
  }, [valorAtual]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const digitos = apenasDigitos(event.target.value);
    const proximoValor = digitos ? Number(digitos) / 100 : null;

    if (!controlado) {
      setValorInterno(proximoValor);
    }

    setTexto(formatarMoeda(proximoValor));
    onValueChange?.(proximoValor);
  }

  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      placeholder="R$ 0,00"
      value={texto}
      onChange={handleChange}
    />
  );
}
