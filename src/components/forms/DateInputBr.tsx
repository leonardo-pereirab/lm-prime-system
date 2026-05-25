"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, ComponentProps } from "react";

import { apenasDigitos } from "@/domain/helpers";
import { Input } from "@/components/ui/Input";

type DateInputBrProps = Omit<
  ComponentProps<typeof Input>,
  "type" | "value" | "defaultValue" | "onChange"
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (valor: string) => void;
};

function formatarDataParcial(valor: string) {
  const digitos = apenasDigitos(valor).slice(0, 8);

  if (digitos.length <= 2) {
    return digitos;
  }

  if (digitos.length <= 4) {
    return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
  }

  return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
}

export function DateInputBr({
  value,
  defaultValue = "",
  onValueChange,
  ...props
}: DateInputBrProps) {
  const controlado = value !== undefined;
  const [valorInterno, setValorInterno] = useState(defaultValue);
  const valorAtual = controlado ? (value ?? "") : valorInterno;
  const [texto, setTexto] = useState(formatarDataParcial(valorAtual));

  useEffect(() => {
    setTexto(formatarDataParcial(valorAtual));
  }, [valorAtual]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const proximoValor = formatarDataParcial(event.target.value);

    if (!controlado) {
      setValorInterno(proximoValor);
    }

    setTexto(proximoValor);
    onValueChange?.(proximoValor);
  }

  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      placeholder="DD/MM/AAAA"
      value={texto}
      onChange={handleChange}
    />
  );
}
