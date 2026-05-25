"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { AddressForm } from "@/components/forms/AddressForm";
import { CpfCnpjInput } from "@/components/forms/CpfCnpjInput";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { apenasDigitos } from "@/domain/helpers";
import type { ActionResult } from "@/lib/server-action";
import {
  parceiroInputSchema,
  type ParceiroInput,
  type ParceiroUpdate,
} from "@/schemas/parceiro";

type ParceiroFormValues = ParceiroInput;
type ParceiroFormInput = z.input<typeof parceiroInputSchema>;
type ParceiroFormOutput = z.output<typeof parceiroInputSchema>;

type ParceiroFormProps = {
  modo: "criar" | "editar";
  valoresIniciais?: Partial<ParceiroFormValues>;
  textoBotaoSalvar?: string;
  onCancelar?: () => void;
  onSucesso?: (parceiroId: string) => void;
  onSubmit: (
    payload: ParceiroInput | ParceiroUpdate,
  ) => Promise<ActionResult<{ id: string }>>;
};

type Secao = "dadosPrincipais" | "contato" | "endereco" | "observacoes";

const secoesPadrao: Record<Secao, boolean> = {
  dadosPrincipais: true,
  contato: true,
  endereco: true,
  observacoes: true,
};

function valorInicialString(valor?: string | null) {
  return valor ?? "";
}

function normalizarOpcional(valor?: string) {
  const texto = valor?.trim();
  return texto ? texto : undefined;
}

export default function ParceiroForm({
  modo,
  valoresIniciais,
  textoBotaoSalvar,
  onCancelar,
  onSucesso,
  onSubmit,
}: ParceiroFormProps) {
  const [secoesAbertas, setSecoesAbertas] =
    useState<Record<Secao, boolean>>(secoesPadrao);

  const form = useForm<ParceiroFormInput, undefined, ParceiroFormOutput>({
    resolver: zodResolver(parceiroInputSchema),
    mode: "onBlur",
    defaultValues: {
      nome: valorInicialString(valoresIniciais?.nome),
      cnpj: valorInicialString(valoresIniciais?.cnpj),
      telefone: valorInicialString(valoresIniciais?.telefone),
      email: valoresIniciais?.email ?? undefined,
      cep: valoresIniciais?.cep ?? undefined,
      logradouro: valorInicialString(valoresIniciais?.logradouro),
      numero: valorInicialString(valoresIniciais?.numero),
      complemento: valorInicialString(valoresIniciais?.complemento),
      bairro: valorInicialString(valoresIniciais?.bairro),
      cidade: valorInicialString(valoresIniciais?.cidade),
      estado: valoresIniciais?.estado ?? undefined,
      ativo: valoresIniciais?.ativo ?? true,
      observacoes: valorInicialString(valoresIniciais?.observacoes),
    },
  });

  function alternarSecao(secao: Secao) {
    setSecoesAbertas((anterior) => ({
      ...anterior,
      [secao]: !anterior[secao],
    }));
  }

  function renderTituloSecao(secao: Secao, titulo: string) {
    const aberta = secoesAbertas[secao];

    return (
      <button
        type="button"
        className="flex w-full items-center justify-between"
        onClick={() => alternarSecao(secao)}
      >
        <CardTitle>{titulo}</CardTitle>
        {aberta ? (
          <ChevronUpIcon className="size-4 text-muted-foreground" />
        ) : (
          <ChevronDownIcon className="size-4 text-muted-foreground" />
        )}
      </button>
    );
  }

  async function enviar(dados: ParceiroFormOutput) {
    const payload: ParceiroInput = {
      nome: dados.nome.trim(),
      cnpj: apenasDigitos(dados.cnpj),
      telefone: apenasDigitos(dados.telefone),
      email: normalizarOpcional(dados.email),
      cep: normalizarOpcional(apenasDigitos(dados.cep ?? "")),
      logradouro: normalizarOpcional(dados.logradouro),
      numero: normalizarOpcional(dados.numero),
      complemento: normalizarOpcional(dados.complemento),
      bairro: normalizarOpcional(dados.bairro),
      cidade: normalizarOpcional(dados.cidade),
      estado: normalizarOpcional(dados.estado),
      ativo: dados.ativo,
      observacoes: normalizarOpcional(dados.observacoes),
    };

    const resultado = await onSubmit(payload);

    if (!resultado.success) {
      if (resultado.error.fields) {
        for (const [campo, mensagem] of Object.entries(
          resultado.error.fields,
        )) {
          form.setError(campo as keyof ParceiroFormValues, {
            message: mensagem,
          });
        }
      }

      toast.error(resultado.error.message);
      return;
    }

    toast.success(
      modo === "criar"
        ? "Parceiro cadastrado com sucesso."
        : "Parceiro atualizado com sucesso.",
    );

    onSucesso?.(resultado.data.id);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(enviar)} className="space-y-4">
        <Card>
          <CardHeader>
            {renderTituloSecao("dadosPrincipais", "Dados principais")}
          </CardHeader>
          {secoesAbertas.dadosPrincipais && (
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Nome da empresa</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Razao social ou nome fantasia"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <CpfCnpjInput
                        placeholder="00.000.000/0000-00"
                        value={field.value}
                        onValueChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>{renderTituloSecao("contato", "Contato")}</CardHeader>
          {secoesAbertas.contato && (
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Somente numeros"
                        inputMode="numeric"
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(event) =>
                          field.onChange(
                            apenasDigitos(event.target.value).slice(0, 11),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Opcional"
                        value={field.value ?? ""}
                        onBlur={field.onBlur}
                        onChange={(event) =>
                          field.onChange(event.target.value || undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>{renderTituloSecao("endereco", "Endereco")}</CardHeader>
          {secoesAbertas.endereco && (
            <CardContent>
              <AddressForm
                control={form.control}
                register={form.register}
                setValue={form.setValue}
                onErroBuscaCep={(mensagem) => toast.error(mensagem)}
              />
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>
            {renderTituloSecao("observacoes", "Observacoes")}
          </CardHeader>
          {secoesAbertas.observacoes && (
            <CardContent>
              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Observacoes opcionais"
                        className="min-h-24"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          )}
        </Card>

        <div className="flex flex-wrap justify-end gap-2">
          {onCancelar ? (
            <Button type="button" variant="outline" onClick={onCancelar}>
              Cancelar
            </Button>
          ) : null}
          <Button
            type="submit"
            disabled={form.formState.isSubmitting || !form.formState.isValid}
          >
            {form.formState.isSubmitting
              ? "Salvando..."
              : (textoBotaoSalvar ??
                (modo === "criar"
                  ? "Cadastrar parceiro"
                  : "Salvar alteracoes"))}
          </Button>
        </div>
      </form>
    </Form>
  );
}
