"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, ComponentProps } from "react";

import { apenasDigitos, formatarCpfCnpj } from "@/domain/helpers";
import { Input } from "@/components/ui/Input";

type CpfCnpjInputProps = Omit<
  ComponentProps<typeof Input>,
  "type" | "value" | "defaultValue" | "onChange"
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (valor: string) => void;
};

function formatarDocumentoParcial(valor: string) {
  const documento = apenasDigitos(valor).slice(0, 14);

  if (documento.length <= 11) {
    return documento
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  return documento
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

export function CpfCnpjInput({
  value,
  defaultValue = "",
  onValueChange,
  ...props
}: CpfCnpjInputProps) {
  const controlado = value !== undefined;
  const [valorInterno, setValorInterno] = useState(apenasDigitos(defaultValue));
  const valorAtual = controlado ? apenasDigitos(value ?? "") : valorInterno;
  const [texto, setTexto] = useState(
    valorAtual.length === 11 || valorAtual.length === 14
      ? formatarCpfCnpj(valorAtual)
      : formatarDocumentoParcial(valorAtual),
  );

  useEffect(() => {
    setTexto(
      valorAtual.length === 11 || valorAtual.length === 14
        ? formatarCpfCnpj(valorAtual)
        : formatarDocumentoParcial(valorAtual),
    );
  }, [valorAtual]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const proximoValor = apenasDigitos(event.target.value).slice(0, 14);

    if (!controlado) {
      setValorInterno(proximoValor);
    }

    setTexto(formatarDocumentoParcial(proximoValor));
    onValueChange?.(proximoValor);
  }

  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      placeholder="000.000.000-00"
      value={texto}
      onChange={handleChange}
    />
  );
}
