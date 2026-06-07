"use client";

import type {
  Control,
  FieldPath,
  FieldValues,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";

import { CepInput } from "@/components/forms/CepInput";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";

type CamposEndereco<TValores extends FieldValues> = {
  cep: FieldPath<TValores>;
  logradouro: FieldPath<TValores>;
  numero: FieldPath<TValores>;
  complemento: FieldPath<TValores>;
  bairro: FieldPath<TValores>;
  cidade: FieldPath<TValores>;
  estado: FieldPath<TValores>;
};

type AddressFormProps<TValores extends FieldValues> = {
  control: Control<TValores>;
  register: UseFormRegister<TValores>;
  setValue: UseFormSetValue<TValores>;
  campos?: Partial<CamposEndereco<TValores>>;
  onErroBuscaCep?: (mensagem: string) => void;
};

function camposPadrao<
  TValores extends FieldValues,
>(): CamposEndereco<TValores> {
  return {
    cep: "cep" as FieldPath<TValores>,
    logradouro: "logradouro" as FieldPath<TValores>,
    numero: "numero" as FieldPath<TValores>,
    complemento: "complemento" as FieldPath<TValores>,
    bairro: "bairro" as FieldPath<TValores>,
    cidade: "cidade" as FieldPath<TValores>,
    estado: "estado" as FieldPath<TValores>,
  };
}

export function AddressForm<TValores extends FieldValues>({
  control,
  setValue,
  campos: camposParciais,
  onErroBuscaCep,
}: AddressFormProps<TValores>) {
  const campos = {
    ...camposPadrao<TValores>(),
    ...camposParciais,
  };

  function preencherCampo(campo: FieldPath<TValores>, valor: string) {
    setValue(campo, valor as never, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <FormField
        control={control}
        name={campos.cep}
        render={({ field }) => (
          <FormItem>
            <FormLabel>CEP</FormLabel>
            <FormControl>
              <CepInput
                value={String(field.value ?? "")}
                onValueChange={(valor) => field.onChange(valor || undefined)}
                onBlur={field.onBlur}
                onEnderecoEncontrado={(endereco) => {
                  if (!endereco) {
                    return;
                  }

                  preencherCampo(campos.logradouro, endereco.logradouro ?? "");
                  preencherCampo(campos.bairro, endereco.bairro ?? "");
                  preencherCampo(campos.cidade, endereco.cidade ?? "");
                  preencherCampo(campos.estado, endereco.estado ?? "");
                }}
                onErroBusca={onErroBuscaCep}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={campos.logradouro}
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Logradouro</FormLabel>
            <FormControl>
              <Input placeholder="Rua, avenida..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={campos.numero}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número</FormLabel>
            <FormControl>
              <Input placeholder="Número" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={campos.complemento}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Complemento</FormLabel>
            <FormControl>
              <Input placeholder="Opcional" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={campos.bairro}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bairro</FormLabel>
            <FormControl>
              <Input placeholder="Bairro" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={campos.cidade}
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Cidade</FormLabel>
            <FormControl>
              <Input placeholder="Cidade" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={campos.estado}
        render={({ field }) => (
          <FormItem>
            <FormLabel>UF</FormLabel>
            <FormControl>
              <Input
                placeholder="UF"
                maxLength={2}
                value={String(field.value ?? "")}
                onBlur={field.onBlur}
                onChange={(event) =>
                  field.onChange(
                    event.target.value.toUpperCase().slice(0, 2) || undefined,
                  )
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
