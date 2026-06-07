"use client";

import { Loader2Icon, SearchIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, ComponentProps } from "react";

import { apenasDigitos } from "@/domain/helpers";
import type { EnderecoCep } from "@/lib/cep";
import { Input } from "@/components/ui/Input";

type CepInputProps = Omit<
  ComponentProps<typeof Input>,
  "type" | "value" | "defaultValue" | "onChange"
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (valor: string) => void;
  onEnderecoEncontrado?: (endereco: EnderecoCep | null) => void;
  onErroBusca?: (mensagem: string) => void;
  buscarAoCompletar?: boolean;
};

function formatarCepParcial(valor: string) {
  const digitos = apenasDigitos(valor).slice(0, 8);

  if (digitos.length <= 5) {
    return digitos;
  }

  return `${digitos.slice(0, 5)}-${digitos.slice(5)}`;
}

export function CepInput({
  value,
  defaultValue = "",
  onValueChange,
  onEnderecoEncontrado,
  onErroBusca,
  buscarAoCompletar = true,
  className,
  ...props
}: CepInputProps) {
  const controlado = value !== undefined;
  const [valorInterno, setValorInterno] = useState(apenasDigitos(defaultValue));
  const [consultando, setConsultando] = useState(false);
  const ultimoCepConsultado = useRef<string | null>(null);
  const valorAtual = controlado ? apenasDigitos(value ?? "") : valorInterno;
  const texto = formatarCepParcial(valorAtual);

  useEffect(() => {
    if (!buscarAoCompletar || valorAtual.length !== 8) {
      return;
    }

    if (ultimoCepConsultado.current === valorAtual) {
      return;
    }

    let cancelado = false;

    async function consultarCep() {
      try {
        setConsultando(true);
        const resposta = await fetch(`/api/cep/${valorAtual}`, {
          cache: "no-store",
        });
        const payload = (await resposta.json()) as {
          data?: EnderecoCep | null;
          error?: { code?: string; message?: string };
          success?: boolean;
        };

        if (cancelado) {
          return;
        }

        if (!resposta.ok || payload.success === false) {
          ultimoCepConsultado.current = valorAtual;
          onEnderecoEncontrado?.(null);
          onErroBusca?.(payload.error?.message ?? "CEP não encontrado.");
          return;
        }

        ultimoCepConsultado.current = valorAtual;
        onEnderecoEncontrado?.(payload.data ?? null);
      } catch (error) {
        if (cancelado) {
          return;
        }

        onEnderecoEncontrado?.(null);
        onErroBusca?.(
          error instanceof Error
            ? error.message
            : "Não foi possível consultar o CEP.",
        );
      } finally {
        if (!cancelado) {
          setConsultando(false);
        }
      }
    }

    void consultarCep();

    return () => {
      cancelado = true;
    };
  }, [buscarAoCompletar, onEnderecoEncontrado, onErroBusca, valorAtual]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const proximoValor = apenasDigitos(event.target.value).slice(0, 8);

    if (!controlado) {
      setValorInterno(proximoValor);
    }

    if (proximoValor.length < 8) {
      ultimoCepConsultado.current = null;
      onEnderecoEncontrado?.(null);
    }

    onValueChange?.(proximoValor);
  }

  return (
    <div className="relative">
      <Input
        {...props}
        className={className}
        type="text"
        inputMode="numeric"
        placeholder="00000-000"
        value={texto}
        onChange={handleChange}
      />
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
        {consultando ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <SearchIcon className="size-4" />
        )}
      </span>
    </div>
  );
}
