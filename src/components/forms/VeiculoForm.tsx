"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { TipoVeiculo } from "@prisma/client";
import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import type { ActionResult } from "@/lib/server-action";
import {
  veiculoInputSchema,
  type VeiculoInput,
  type VeiculoUpdate,
} from "@/schemas/veiculo";
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

type VeiculoFormValues = VeiculoInput;
type VeiculoFormInput = z.input<typeof veiculoInputSchema>;
type VeiculoFormOutput = z.output<typeof veiculoInputSchema>;

type VeiculoFormProps = {
  modo: "criar" | "editar";
  valoresIniciais?: Partial<VeiculoFormValues>;
  textoBotaoSalvar?: string;
  onCancelar?: () => void;
  onSucesso?: (veiculoId: string) => void;
  onSubmit: (
    payload: VeiculoInput | VeiculoUpdate,
  ) => Promise<ActionResult<{ id: string }>>;
};

type Secao = "dadosPrincipais" | "identificacao" | "observacoes";

const secoesPadrao: Record<Secao, boolean> = {
  dadosPrincipais: true,
  identificacao: true,
  observacoes: true,
};

const opcoesTipo: { value: TipoVeiculo; label: string }[] = [
  { value: TipoVeiculo.CARRO_PASSEIO, label: "Carro de passeio" },
  { value: TipoVeiculo.VAN, label: "Van" },
  { value: TipoVeiculo.MICRO_ONIBUS, label: "Micro-ônibus" },
  { value: TipoVeiculo.ONIBUS, label: "Ônibus" },
  { value: TipoVeiculo.OUTRO, label: "Outro" },
];

function valorInicialString(valor?: string | null) {
  return valor ?? "";
}

function normalizarOpcional(valor?: string) {
  const texto = valor?.trim();
  return texto ? texto : undefined;
}

function formatarPlaca(valor: string) {
  return valor
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 7);
}

export default function VeiculoForm({
  modo,
  valoresIniciais,
  textoBotaoSalvar,
  onCancelar,
  onSucesso,
  onSubmit,
}: VeiculoFormProps) {
  const [secoesAbertas, setSecoesAbertas] =
    useState<Record<Secao, boolean>>(secoesPadrao);

  const form = useForm<VeiculoFormInput, undefined, VeiculoFormOutput>({
    resolver: zodResolver(veiculoInputSchema),
    mode: "onBlur",
    defaultValues: {
      placa: valorInicialString(valoresIniciais?.placa),
      modelo: valorInicialString(valoresIniciais?.modelo),
      marca: valorInicialString(valoresIniciais?.marca),
      ano: valoresIniciais?.ano,
      capacidade: valoresIniciais?.capacidade,
      tipo: valoresIniciais?.tipo ?? TipoVeiculo.VAN,
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

  async function enviar(dados: VeiculoFormOutput) {
    const payload: VeiculoInput = {
      placa: formatarPlaca(dados.placa),
      modelo: dados.modelo.trim(),
      marca: dados.marca.trim(),
      ano: dados.ano,
      capacidade: dados.capacidade,
      tipo: dados.tipo,
      ativo: dados.ativo,
      observacoes: normalizarOpcional(dados.observacoes),
    };

    const resultado = await onSubmit(payload);

    if (!resultado.success) {
      if (resultado.error.fields) {
        for (const [campo, mensagem] of Object.entries(
          resultado.error.fields,
        )) {
          form.setError(campo as keyof VeiculoFormValues, {
            message: mensagem,
          });
        }
      }

      toast.error(resultado.error.message);
      return;
    }

    toast.success(
      modo === "criar"
        ? "Veículo cadastrado com sucesso."
        : "Veículo atualizado com sucesso.",
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
                name="modelo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex.: Sprinter 415" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marca"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex.: Mercedes-Benz" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {opcoesTipo.map((opcao) => (
                          <SelectItem key={opcao.value} value={opcao.value}>
                            {opcao.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capacidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacidade</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        inputMode="numeric"
                        placeholder="Quantidade de passageiros"
                        value={
                          typeof field.value === "number" ||
                          typeof field.value === "string"
                            ? field.value
                            : ""
                        }
                        onBlur={field.onBlur}
                        onChange={(event) => field.onChange(event.target.value)}
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
            {renderTituloSecao("identificacao", "Identificação")}
          </CardHeader>
          {secoesAbertas.identificacao && (
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="placa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placa</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ABC1234 ou BRA2E19"
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(event) =>
                          field.onChange(formatarPlaca(event.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ano"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1970}
                        max={new Date().getFullYear() + 1}
                        inputMode="numeric"
                        placeholder="Ano do veículo"
                        value={
                          typeof field.value === "number" ||
                          typeof field.value === "string"
                            ? field.value
                            : ""
                        }
                        onBlur={field.onBlur}
                        onChange={(event) => field.onChange(event.target.value)}
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
            {renderTituloSecao("observacoes", "Observações")}
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
                        placeholder="Observações opcionais"
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
                (modo === "criar" ? "Cadastrar veículo" : "Salvar alterações"))}
          </Button>
        </div>
      </form>
    </Form>
  );
}
