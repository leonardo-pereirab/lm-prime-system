"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type {
  FormaPagamento,
  StatusAtendimento,
  TipoVeiculo,
} from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import {
  avancarParaReserva,
  cancelarAtendimento,
  cancelarOrcamento,
  salvarOrcamento,
} from "@/app/(admin)/atendimentos/_actions";
import CountdownValidade from "@/components/atendimento/CountdownValidade";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { DateInputBr } from "@/components/forms/DateInputBr";
import { MoneyInput } from "@/components/forms/MoneyInput";
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
import { orcamentoInputSchema } from "@/schemas/orcamento";

type OrcamentoFormInput = z.input<typeof orcamentoInputSchema>;
type OrcamentoFormValues = z.output<typeof orcamentoInputSchema>;

type OrcamentoValoresIniciais = Partial<OrcamentoFormValues> & {
  validoAte?: Date | string | null;
};

type OrcamentoFormProps = {
  atendimentoId: string;
  statusAtual: StatusAtendimento;
  valoresIniciais?: OrcamentoValoresIniciais;
};

type AcaoSensivel =
  | "salvar"
  | "limpar"
  | "cancelarOrcamento"
  | "encerrarAtendimento"
  | "irReserva";

const OPCOES_FORMA_PAGAMENTO: Array<{ value: FormaPagamento; label: string }> =
  [
    { value: "DINHEIRO", label: "Dinheiro" },
    { value: "PIX", label: "Pix" },
    { value: "CARTAO_CREDITO", label: "Cartao de credito" },
    { value: "CARTAO_DEBITO", label: "Cartao de debito" },
    { value: "TRANSFERENCIA", label: "Transferencia" },
    { value: "BOLETO", label: "Boleto" },
  ];

const OPCOES_TIPO_VEICULO: Array<{ value: TipoVeiculo; label: string }> = [
  { value: "CARRO_PASSEIO", label: "Carro passeio" },
  { value: "VAN", label: "Van" },
  { value: "MICRO_ONIBUS", label: "Micro-onibus" },
  { value: "ONIBUS", label: "Onibus" },
  { value: "OUTRO", label: "Outro" },
];

function parseDataBr(valor: string): Date | undefined {
  const texto = valor.trim();
  if (!texto) {
    return undefined;
  }

  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto);
  if (!partes) {
    return undefined;
  }

  const dia = Number(partes[1]);
  const mes = Number(partes[2]);
  const ano = Number(partes[3]);
  const data = new Date(Date.UTC(ano, mes - 1, dia, 12, 0, 0, 0));

  if (
    Number.isNaN(data.getTime()) ||
    data.getUTCDate() !== dia ||
    data.getUTCMonth() !== mes - 1 ||
    data.getUTCFullYear() !== ano
  ) {
    return undefined;
  }

  return data;
}

function formatarDataBr(data?: Date) {
  if (!data || Number.isNaN(data.getTime())) {
    return "";
  }

  const dia = String(data.getUTCDate()).padStart(2, "0");
  const mes = String(data.getUTCMonth() + 1).padStart(2, "0");
  const ano = String(data.getUTCFullYear());

  return `${dia}/${mes}/${ano}`;
}

function normalizarTexto(valor?: string) {
  const texto = valor?.trim();
  return texto ? texto : undefined;
}

function normalizarData(valor?: Date | string | null) {
  if (!valor) {
    return undefined;
  }

  const data = valor instanceof Date ? valor : new Date(valor);
  return Number.isNaN(data.getTime()) ? undefined : data;
}

function normalizarVeiculosPrevistos(
  veiculos?: OrcamentoValoresIniciais["veiculosPrevistos"],
) {
  if (!Array.isArray(veiculos) || veiculos.length === 0) {
    return [{ tipo: "VAN" as TipoVeiculo, quantidade: 1 }];
  }

  return veiculos.map((veiculo) => ({
    tipo: veiculo.tipo,
    quantidade: Number(veiculo.quantidade) || 1,
  }));
}

function montarValoresPadrao(
  valoresIniciais?: OrcamentoValoresIniciais,
): OrcamentoFormValues {
  return {
    valorTotal:
      typeof valoresIniciais?.valorTotal === "number"
        ? valoresIniciais.valorTotal
        : 0,
    formaPagamento: valoresIniciais?.formaPagamento ?? "PIX",
    dataVencimento: normalizarData(valoresIniciais?.dataVencimento),
    veiculosPrevistos: normalizarVeiculosPrevistos(
      valoresIniciais?.veiculosPrevistos,
    ),
    observacoes: normalizarTexto(valoresIniciais?.observacoes),
  };
}

export default function OrcamentoForm({
  atendimentoId,
  statusAtual,
  valoresIniciais,
}: OrcamentoFormProps) {
  const router = useRouter();
  const [confirmacao, setConfirmacao] = useState<AcaoSensivel | null>(null);
  const [emAcao, setEmAcao] = useState(false);
  const possuiOrcamentoInicial = Boolean(valoresIniciais?.validoAte);
  const [modoEdicao, setModoEdicao] = useState(!possuiOrcamentoInicial);
  const [orcamentoSalvo, setOrcamentoSalvo] = useState(possuiOrcamentoInicial);
  const [validoAteAtual, setValidoAteAtual] = useState<Date | null>(
    normalizarData(valoresIniciais?.validoAte) ?? null,
  );
  const [orcamentoExpirado, setOrcamentoExpirado] = useState(
    validoAteAtual ? validoAteAtual.getTime() <= Date.now() : false,
  );

  const podeEditar =
    statusAtual === "AGUARDANDO_ORCAMENTO" ||
    statusAtual === "ORCAMENTO_REGISTRADO_AG_APROVACAO";

  const form = useForm<OrcamentoFormInput, unknown, OrcamentoFormValues>({
    resolver: zodResolver(orcamentoInputSchema),
    defaultValues: montarValoresPadrao(valoresIniciais) as OrcamentoFormInput,
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "veiculosPrevistos",
  });

  const bloqueado = emAcao || !modoEdicao || !podeEditar;

  const podeIrParaReserva = useMemo(() => {
    return orcamentoSalvo && !orcamentoExpirado && !emAcao;
  }, [emAcao, orcamentoExpirado, orcamentoSalvo]);

  function abrirConfirmacao(acao: AcaoSensivel) {
    setConfirmacao(acao);
  }

  function fecharConfirmacao() {
    setConfirmacao(null);
  }

  async function salvar(dados: OrcamentoFormValues) {
    setEmAcao(true);

    const resultado = await salvarOrcamento(atendimentoId, {
      valorTotal: dados.valorTotal,
      formaPagamento: dados.formaPagamento,
      dataVencimento: dados.dataVencimento,
      veiculosPrevistos: dados.veiculosPrevistos.map((veiculo) => ({
        tipo: veiculo.tipo,
        quantidade: Number(veiculo.quantidade),
      })),
      observacoes: normalizarTexto(dados.observacoes),
    });

    setEmAcao(false);

    if (!resultado.success) {
      if (resultado.error.fields) {
        for (const [campo, mensagem] of Object.entries(
          resultado.error.fields,
        )) {
          form.setError(campo as keyof OrcamentoFormValues, {
            message: mensagem,
          });
        }
      }

      toast.error(resultado.error.message);
      return;
    }

    const proximaValidade = normalizarData(resultado.data.validoAte);
    setValidoAteAtual(proximaValidade ?? null);
    setOrcamentoExpirado(
      proximaValidade ? proximaValidade.getTime() <= Date.now() : false,
    );
    setOrcamentoSalvo(true);
    setModoEdicao(false);
    toast.success("Orcamento salvo com sucesso.");
    router.refresh();
  }

  async function executarConfirmacao() {
    if (!confirmacao) {
      return;
    }

    if (confirmacao === "salvar") {
      await form.handleSubmit(salvar)();
      return;
    }

    if (confirmacao === "limpar") {
      form.reset(montarValoresPadrao(undefined));
      toast.success("Campos limpos.");
      return;
    }

    if (confirmacao === "cancelarOrcamento") {
      setEmAcao(true);
      const resultado = await cancelarOrcamento(atendimentoId);
      setEmAcao(false);

      if (!resultado.success) {
        toast.error(resultado.error.message);
        return;
      }

      toast.success("Orcamento cancelado com sucesso.");
      router.refresh();
      return;
    }

    if (confirmacao === "encerrarAtendimento") {
      if (orcamentoSalvo) {
        setEmAcao(true);
        const resultado = await cancelarOrcamento(atendimentoId);
        setEmAcao(false);

        if (!resultado.success) {
          toast.error(resultado.error.message);
          return;
        }

        toast.success("Atendimento encerrado com cancelamento do orcamento.");
        router.push("/atendimentos");
        return;
      }

      setEmAcao(true);
      const resultado = await cancelarAtendimento(atendimentoId, {
        etapa: "ATENDIMENTO_CANCELADO",
      });
      setEmAcao(false);

      if (!resultado.success) {
        toast.error(resultado.error.message);
        return;
      }

      toast.success("Atendimento encerrado.");
      router.push("/atendimentos");
      return;
    }

    setEmAcao(true);
    const resultado = await avancarParaReserva(atendimentoId);
    setEmAcao(false);

    if (!resultado.success) {
      toast.error(resultado.error.message);
      return;
    }

    toast.success("Orcamento aprovado. Atendimento enviado para reserva.");
    router.push(`/atendimentos/${atendimentoId}/reserva`);
  }

  const tituloConfirmacao: Record<AcaoSensivel, string> = {
    salvar: "Salvar orcamento",
    limpar: "Limpar campos",
    cancelarOrcamento: "Cancelar orcamento",
    encerrarAtendimento: "Encerrar atendimento",
    irReserva: "Ir para reserva",
  };

  const descricaoConfirmacao: Record<AcaoSensivel, string> = {
    salvar: "Deseja salvar os dados de orcamento informados?",
    limpar: "Deseja limpar os campos do formulario de orcamento?",
    cancelarOrcamento:
      "Deseja cancelar este orcamento? A etapa sera encerrada e o historico sera mantido.",
    encerrarAtendimento:
      "Deseja encerrar o atendimento nesta etapa? Esta acao nao remove registros historicos.",
    irReserva:
      "Deseja confirmar o orcamento e avancar para a etapa de reserva?",
  };

  return (
    <>
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(salvar)}>
          <Card>
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle>Orcamento</CardTitle>
                {orcamentoSalvo && !modoEdicao ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModoEdicao(true)}
                    disabled={!podeEditar || emAcao}
                  >
                    Editar
                  </Button>
                ) : null}
              </div>

              {validoAteAtual ? (
                <CountdownValidade
                  validoAte={validoAteAtual}
                  onExpiradoChange={setOrcamentoExpirado}
                />
              ) : null}
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="valorTotal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor total</FormLabel>
                    <FormControl>
                      <MoneyInput
                        value={field.value}
                        onValueChange={(valor) => {
                          field.onChange(valor ?? 0);
                        }}
                        disabled={bloqueado}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="formaPagamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de pagamento</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={bloqueado}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {OPCOES_FORMA_PAGAMENTO.map((opcao) => (
                            <SelectItem key={opcao.value} value={opcao.value}>
                              {opcao.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dataVencimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de vencimento</FormLabel>
                    <FormControl>
                      <DateInputBr
                        value={formatarDataBr(
                          normalizarData(
                            field.value as Date | string | null | undefined,
                          ) ?? undefined,
                        )}
                        onValueChange={(valor) => {
                          field.onChange(parseDataBr(valor));
                        }}
                        disabled={bloqueado}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Observacoes</FormLabel>
                    <FormControl>
                      <Textarea
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        rows={4}
                        disabled={bloqueado}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Veiculos previstos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.map((item, indice) => (
                <div
                  key={item.id}
                  className="grid gap-3 rounded-md border p-3 md:grid-cols-[1fr_180px_auto]"
                >
                  <FormField
                    control={form.control}
                    name={`veiculosPrevistos.${indice}.tipo`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de veiculo</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={bloqueado}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {OPCOES_TIPO_VEICULO.map((opcao) => (
                                <SelectItem
                                  key={opcao.value}
                                  value={opcao.value}
                                >
                                  {opcao.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`veiculosPrevistos.${indice}.quantidade`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantidade</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            step={1}
                            value={String(field.value)}
                            onChange={(event) => {
                              const valor = Number(event.target.value);
                              field.onChange(
                                Number.isFinite(valor) ? valor : 1,
                              );
                            }}
                            disabled={bloqueado}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => remove(indice)}
                      disabled={bloqueado || fields.length === 1}
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => append({ tipo: "VAN", quantidade: 1 })}
                disabled={bloqueado}
              >
                + Adicionar veiculo
              </Button>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => abrirConfirmacao("salvar")}
              disabled={emAcao || !modoEdicao || !podeEditar}
            >
              Salvar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => abrirConfirmacao("limpar")}
              disabled={emAcao || !modoEdicao || !podeEditar}
            >
              Limpar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => abrirConfirmacao("cancelarOrcamento")}
              disabled={emAcao || !orcamentoSalvo}
            >
              Cancelar orcamento
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => abrirConfirmacao("encerrarAtendimento")}
              disabled={emAcao}
            >
              Encerrar atendimento
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href={`/atendimentos/${atendimentoId}/solicitacao`}>
                Voltar para solicitacao
              </Link>
            </Button>
            <Button
              type="button"
              onClick={() => abrirConfirmacao("irReserva")}
              disabled={!podeIrParaReserva}
            >
              Ir para reserva
            </Button>
          </div>
        </form>
      </Form>

      <ConfirmDialog
        aberto={Boolean(confirmacao)}
        onAbertoChange={(aberto) => {
          if (!aberto) {
            fecharConfirmacao();
          }
        }}
        titulo={confirmacao ? tituloConfirmacao[confirmacao] : ""}
        descricao={confirmacao ? descricaoConfirmacao[confirmacao] : ""}
        textoConfirmar={
          confirmacao === "irReserva"
            ? "Ir para reserva"
            : confirmacao === "salvar"
              ? "Salvar"
              : "Confirmar"
        }
        textoCancelar="Cancelar"
        varianteConfirmar={
          confirmacao === "cancelarOrcamento" ||
          confirmacao === "encerrarAtendimento"
            ? "destructive"
            : "default"
        }
        carregando={emAcao}
        onConfirmar={executarConfirmacao}
      />
    </>
  );
}
