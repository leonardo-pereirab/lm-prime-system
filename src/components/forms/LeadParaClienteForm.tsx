"use client";

import type {
  Control,
  FieldPath,
  FieldValues,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";

import { AddressForm } from "@/components/forms/AddressForm";
import { CpfCnpjInput } from "@/components/forms/CpfCnpjInput";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";

export type LeadParaClienteDados = {
  novoCliente?: {
    nome: string;
    cpfCnpj: string;
    rgIe?: string;
    telefone: string;
    telefoneSec?: string;
    email?: string;
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    ativo?: boolean;
    observacoes?: string;
  };
};

type LeadParaClienteFormProps<TValores extends LeadParaClienteDados> = {
  control: Control<TValores>;
  register: UseFormRegister<TValores>;
  setValue: UseFormSetValue<TValores>;
  disabled?: boolean;
};

export default function LeadParaClienteForm<
  TValores extends LeadParaClienteDados,
>({
  control,
  register,
  setValue,
  disabled = false,
}: LeadParaClienteFormProps<TValores>) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={control}
          name={"novoCliente.nome" as FieldPath<TValores>}
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Nome do cliente</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nome completo"
                  value={String(field.value ?? "")}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={"novoCliente.cpfCnpj" as FieldPath<TValores>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF/CNPJ</FormLabel>
              <FormControl>
                <CpfCnpjInput
                  value={String(field.value ?? "")}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={"novoCliente.rgIe" as FieldPath<TValores>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>RG/IE</FormLabel>
              <FormControl>
                <Input
                  placeholder="Opcional"
                  value={String(field.value ?? "")}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={"novoCliente.telefone" as FieldPath<TValores>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input
                  placeholder="(00) 00000-0000"
                  value={String(field.value ?? "")}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={"novoCliente.telefoneSec" as FieldPath<TValores>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone secundario</FormLabel>
              <FormControl>
                <Input
                  placeholder="Opcional"
                  value={String(field.value ?? "")}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={"novoCliente.email" as FieldPath<TValores>}
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input
                  placeholder="Opcional"
                  value={String(field.value ?? "")}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <AddressForm
        control={control as unknown as Control<FieldValues>}
        register={register as unknown as UseFormRegister<FieldValues>}
        setValue={setValue as unknown as UseFormSetValue<FieldValues>}
        campos={{
          cep: "novoCliente.cep" as FieldPath<FieldValues>,
          logradouro: "novoCliente.logradouro" as FieldPath<FieldValues>,
          numero: "novoCliente.numero" as FieldPath<FieldValues>,
          complemento: "novoCliente.complemento" as FieldPath<FieldValues>,
          bairro: "novoCliente.bairro" as FieldPath<FieldValues>,
          cidade: "novoCliente.cidade" as FieldPath<FieldValues>,
          estado: "novoCliente.estado" as FieldPath<FieldValues>,
        }}
      />
    </div>
  );
}
