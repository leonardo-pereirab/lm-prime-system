"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { apenasDigitos, formatarCpfCnpj } from "@/domain/helpers";
import type { ActionResult } from "@/lib/server-action";
import {
  motoristaInputSchema,
  type MotoristaInput,
  type MotoristaUpdate,
} from "@/schemas/motorista";
import { DateInputBr } from "@/components/forms/DateInputBr";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

type MotoristaFormValues = MotoristaInput;
type MotoristaFormInput = z.input<typeof motoristaInputSchema>;
type MotoristaFormOutput = z.output<typeof motoristaInputSchema>;

type MotoristaFormProps = {
  modo: "criar" | "editar";
  valoresIniciais?: Partial<
    Omit<MotoristaFormValues, "cnhValidade"> & {
      cnhCategoria: "A" | "B" | "C" | "D" | "E";
      cnhValidade: string | Date;
    }
  >;
  textoBotaoSalvar?: string;
  onCancelar?: () => void;
  onSucesso?: (motoristaId: string) => void;
  onSubmit: (
    payload: MotoristaInput | MotoristaUpdate,
  ) => Promise<ActionResult<{ id: string }>>;
};

type Secao = "dadosPessoais" | "cnh" | "observacoes";

const secoesPadrao: Record<Secao, boolean> = {
  dadosPessoais: true,
  cnh: true,
  observacoes: true,
};

function valorInicialString(valor?: string | null) {
  return valor ?? "";
}

function normalizarOpcional(valor?: string) {
  const texto = valor?.trim();
  return texto ? texto : undefined;
}

function formatoDataIso(data: string | Date | undefined) {
  if (!data) {
    return "";
  }

  if (data instanceof Date) {
    if (Number.isNaN(data.getTime())) {
      return "";
    }
    const dia = String(data.getUTCDate()).padStart(2, "0");
    const mes = String(data.getUTCMonth() + 1).padStart(2, "0");
    const ano = data.getUTCFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  if (data.includes("/")) {
    return data;
  }

  const match = data.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }

  return data;
}
export default function MotoristaForm({
  modo,
  valoresIniciais,
  textoBotaoSalvar,
  onCancelar,
  onSucesso,
  onSubmit,
}: MotoristaFormProps) {
  const [secoesAbertas, setSecoesAbertas] =
    useState<Record<Secao, boolean>>(secoesPadrao);

  const form = useForm<MotoristaFormInput, undefined, MotoristaFormOutput>({
    resolver: zodResolver(motoristaInputSchema),
    mode: "onBlur",
    defaultValues: {
      nome: valorInicialString(valoresIniciais?.nome),
      cpf: valorInicialString(valoresIniciais?.cpf),
      telefone: valorInicialString(valoresIniciais?.telefone),
      cnh: valorInicialString(valoresIniciais?.cnh),
      cnhCategoria:
        (valoresIniciais?.cnhCategoria as "A" | "B" | "C" | "D" | "E") ?? "B",
      cnhValidade: formatoDataIso(valoresIniciais?.cnhValidade),
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

  async function enviar(dados: MotoristaFormOutput) {
    const payload: MotoristaInput = {
      nome: dados.nome.trim(),
      cpf: apenasDigitos(dados.cpf),
      telefone: apenasDigitos(dados.telefone),
      cnh: dados.cnh.trim(),
      cnhCategoria: dados.cnhCategoria,
      cnhValidade: dados.cnhValidade,
      ativo: dados.ativo,
      observacoes: normalizarOpcional(dados.observacoes),
    };

    const resultado = await onSubmit(payload);

    if (!resultado.success) {
      if (resultado.error.fields) {
        for (const [campo, mensagem] of Object.entries(
          resultado.error.fields,
        )) {
          form.setError(campo as keyof MotoristaFormValues, {
            message: mensagem,
          });
        }
      }

      toast.error(resultado.error.message);
      return;
    }

    toast.success(
      modo === "criar"
        ? "Motorista cadastrado com sucesso."
        : "Motorista atualizado com sucesso.",
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
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="000.000.000-00"
                        inputMode="numeric"
                        value={
                          field.value && apenasDigitos(field.value).length > 0
                            ? formatarCpfCnpj(apenasDigitos(field.value))
                            : ""
                        }
                        onBlur={field.onBlur}
                        onChange={(event) => {
                          field.onChange(
                            apenasDigitos(event.target.value).slice(0, 11),
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>{renderTituloSecao("cnh", "CNH")}</CardHeader>
          {secoesAbertas.cnh && (
            <CardContent className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="cnh"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numero da CNH</FormLabel>
                    <FormControl>
                      <Input placeholder="Informe a CNH" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cnhCategoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                        <SelectItem value="E">E</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cnhValidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Validade da CNH</FormLabel>
                    <FormControl>
                      <DateInputBr
                        value={formatoDataIso(field.value as string | Date)}
                        onValueChange={field.onChange}
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
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? "Salvando..."
              : (textoBotaoSalvar ??
                (modo === "criar"
                  ? "Cadastrar motorista"
                  : "Salvar alteracoes"))}
          </Button>
        </div>
      </form>
    </Form>
  );
}
