"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { AddressForm } from "@/components/forms/AddressForm";
import { apenasDigitos } from "@/domain/helpers";
import type { ActionResult } from "@/lib/server-action";
import {
  clienteInputSchema,
  type ClienteInput,
  type ClienteUpdate,
} from "@/schemas/cliente";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CpfCnpjInput } from "@/components/forms/CpfCnpjInput";
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

type ClienteFormValues = ClienteInput;
type ClienteFormInput = z.input<typeof clienteInputSchema>;
type ClienteFormOutput = z.output<typeof clienteInputSchema>;

type ClienteFormProps = {
  modo: "criar" | "editar";
  valoresIniciais?: Partial<ClienteFormValues>;
  textoBotaoSalvar?: string;
  onCancelar?: () => void;
  onSucesso?: (clienteId: string) => void;
  onSubmit: (
    payload: ClienteInput | ClienteUpdate,
  ) => Promise<ActionResult<{ id: string }>>;
};

type Secao = "dadosPessoais" | "contato" | "endereco" | "observacoes";

const secoesPadrao: Record<Secao, boolean> = {
  dadosPessoais: true,
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

export default function ClienteForm({
  modo,
  valoresIniciais,
  textoBotaoSalvar,
  onCancelar,
  onSucesso,
  onSubmit,
}: ClienteFormProps) {
  const [secoesAbertas, setSecoesAbertas] =
    useState<Record<Secao, boolean>>(secoesPadrao);

  const form = useForm<ClienteFormInput, undefined, ClienteFormOutput>({
    resolver: zodResolver(clienteInputSchema),
    mode: "onBlur",
    defaultValues: {
      nome: valorInicialString(valoresIniciais?.nome),
      cpfCnpj: valorInicialString(valoresIniciais?.cpfCnpj),
      rgIe: valorInicialString(valoresIniciais?.rgIe),
      telefone: valorInicialString(valoresIniciais?.telefone),
      telefoneSec: valoresIniciais?.telefoneSec,
      email: valoresIniciais?.email,
      cep: valoresIniciais?.cep,
      logradouro: valorInicialString(valoresIniciais?.logradouro),
      numero: valorInicialString(valoresIniciais?.numero),
      complemento: valorInicialString(valoresIniciais?.complemento),
      bairro: valorInicialString(valoresIniciais?.bairro),
      cidade: valorInicialString(valoresIniciais?.cidade),
      estado: valoresIniciais?.estado,
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

  async function enviar(dados: ClienteFormOutput) {
    const payload: ClienteInput = {
      nome: dados.nome.trim(),
      cpfCnpj: apenasDigitos(dados.cpfCnpj),
      rgIe: normalizarOpcional(dados.rgIe),
      telefone: apenasDigitos(dados.telefone),
      telefoneSec: normalizarOpcional(apenasDigitos(dados.telefoneSec ?? "")),
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
          form.setError(campo as keyof ClienteFormValues, {
            message: mensagem,
          });
        }
      }

      toast.error(resultado.error.message);
      return;
    }

    toast.success(
      modo === "criar"
        ? "Cliente cadastrado com sucesso."
        : "Cliente atualizado com sucesso.",
    );

    onSucesso?.(resultado.data.id);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(enviar)} className="space-y-4">
        <Card>
          <CardHeader>
            {renderTituloSecao("dadosPessoais", "Dados pessoais")}
          </CardHeader>
          {secoesAbertas.dadosPessoais && (
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpfCnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF/CNPJ</FormLabel>
                    <FormControl>
                      <CpfCnpjInput
                        value={field.value}
                        onValueChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rgIe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RG/IE</FormLabel>
                    <FormControl>
                      <Input placeholder="Opcional" {...field} />
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
                    <FormLabel>Telefone principal</FormLabel>
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
                name="telefoneSec"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone secundario</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Opcional"
                        inputMode="numeric"
                        value={field.value ?? ""}
                        onBlur={field.onBlur}
                        onChange={(event) => {
                          const valor = apenasDigitos(event.target.value).slice(
                            0,
                            11,
                          );
                          field.onChange(valor || undefined);
                        }}
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
                  <FormItem className="md:col-span-2">
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Opcional"
                        value={field.value ?? ""}
                        onChange={(event) =>
                          field.onChange(event.target.value || undefined)
                        }
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
                    <FormLabel>Observacoes</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Informacoes adicionais"
                        value={field.value ?? ""}
                        onChange={field.onChange}
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

        <div className="flex items-center justify-end gap-2">
          {onCancelar && (
            <Button
              type="button"
              variant="outline"
              disabled={form.formState.isSubmitting}
              onClick={onCancelar}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? "Salvando..."
              : (textoBotaoSalvar ?? "Salvar")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
