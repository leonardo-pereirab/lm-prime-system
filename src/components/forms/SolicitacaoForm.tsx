"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { TipoServico, type StatusAtendimento } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import type { z } from "zod";
import { toast } from "sonner";

import {
  avancarEtapa,
  atualizarSolicitacao,
  cancelarAtendimento,
  cancelarAtendimentoSemSalvar,
  criarAtendimento,
} from "@/app/(admin)/atendimentos/_actions";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { DateInputBr } from "@/components/forms/DateInputBr";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/Command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Textarea } from "@/components/ui/Textarea";
import { apenasDigitos } from "@/domain/helpers";
import { useClientes } from "@/hooks/useClientes";
import {
  solicitacaoInputSchema,
  type SolicitacaoInput,
} from "@/schemas/atendimento";

const TIPO_CONTATO = {
  CLIENTE: "CLIENTE",
  LEAD: "LEAD",
} as const;

type TipoContato = (typeof TIPO_CONTATO)[keyof typeof TIPO_CONTATO];

type AcaoSensivel =
  | "salvar"
  | "limpar"
  | "cancelarESair"
  | "encerrar"
  | "irOrcamento";

type SolicitacaoFormInput = z.input<typeof solicitacaoInputSchema>;
type SolicitacaoFormOutput = z.output<typeof solicitacaoInputSchema>;

type SolicitacaoValoresIniciais = {
  clienteId?: string | null;
  leadNome?: string | null;
  leadTelefone?: string | null;
  tipoServico?: TipoServico | null;
  dataContato?: Date | string | null;
  dataServico?: Date | string | null;
  precisaNotaFiscal?: boolean | null;
  qtdPassageiros?: number | null;
  observacoes?: string | null;
  trajeto?: Array<{
    origem?: string | null;
    destino?: string | null;
    hora?: string | null;
    data?: Date | string | null;
    observacoes?: string | null;
  }> | null;
};

type SolicitacaoFormProps = {
  modo: "criar" | "editar";
  atendimentoId?: string;
  statusAtual?: StatusAtendimento;
  valoresIniciais?: SolicitacaoValoresIniciais;
};

const OPCOES_TIPO_SERVICO: Array<{ value: TipoServico; label: string }> = [
  { value: TipoServico.VIAGEM, label: "Viagem" },
  { value: TipoServico.EXCURSAO, label: "Excursão" },
  { value: TipoServico.PASSEIO, label: "Passeio" },
  { value: TipoServico.FEIRA, label: "Feira" },
  { value: TipoServico.CONVENCAO, label: "Convenção" },
  { value: TipoServico.CASAMENTO, label: "Casamento" },
  { value: TipoServico.TRANSFERE, label: "Transfere" },
  { value: TipoServico.OUTRO, label: "Outro" },
];

function criarDataUtc(data: number, mes: number, ano: number): Date {
  return new Date(Date.UTC(ano, mes - 1, data, 12, 0, 0, 0));
}

function parseDataBr(valor: string): Date | undefined {
  const texto = valor.trim();
  if (!texto) {
    return undefined;
  }

  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto);
  if (!match) {
    return undefined;
  }

  const dia = Number(match[1]);
  const mes = Number(match[2]);
  const ano = Number(match[3]);

  if (
    !Number.isFinite(dia) ||
    !Number.isFinite(mes) ||
    !Number.isFinite(ano) ||
    dia < 1 ||
    dia > 31 ||
    mes < 1 ||
    mes > 12
  ) {
    return undefined;
  }

  const data = criarDataUtc(dia, mes, ano);
  if (
    data.getUTCFullYear() !== ano ||
    data.getUTCMonth() !== mes - 1 ||
    data.getUTCDate() !== dia
  ) {
    return undefined;
  }

  return data;
}

function formatarDataBr(valor?: unknown): string {
  if (!valor) {
    return "";
  }

  const data =
    valor instanceof Date
      ? valor
      : typeof valor === "string" || typeof valor === "number"
        ? new Date(valor)
        : null;

  if (!data) {
    return "";
  }

  if (Number.isNaN(data.getTime())) {
    return "";
  }

  const dia = String(data.getUTCDate()).padStart(2, "0");
  const mes = String(data.getUTCMonth() + 1).padStart(2, "0");
  const ano = String(data.getUTCFullYear());

  return `${dia}/${mes}/${ano}`;
}

function normalizarTextoOpcional(valor?: string | null) {
  const texto = valor?.trim();
  return texto ? texto : undefined;
}

function criarTrechoPadrao(
  dataBase: Date,
): SolicitacaoInput["trajeto"][number] {
  return {
    origem: "",
    destino: "",
    hora: "08:00",
    data: dataBase,
    observacoes: undefined,
  };
}

function montarValoresPadrao(
  valoresIniciais?: SolicitacaoValoresIniciais,
): SolicitacaoFormInput {
  const hoje = new Date();
  const dataContato =
    valoresIniciais?.dataContato != null
      ? new Date(valoresIniciais.dataContato)
      : hoje;
  const dataServico =
    valoresIniciais?.dataServico != null
      ? new Date(valoresIniciais.dataServico)
      : undefined;

  const trajetoInicial =
    valoresIniciais?.trajeto
      ?.filter(Boolean)
      .slice(0, 2)
      .map((trecho) => ({
        origem: trecho.origem ?? "",
        destino: trecho.destino ?? "",
        hora: trecho.hora ?? "08:00",
        data:
          trecho.data != null
            ? new Date(trecho.data)
            : (dataServico ?? dataContato),
        observacoes: normalizarTextoOpcional(trecho.observacoes),
      })) ?? [];

  return {
    clienteId: valoresIniciais?.clienteId ?? undefined,
    leadNome: normalizarTextoOpcional(valoresIniciais?.leadNome),
    leadTelefone: normalizarTextoOpcional(valoresIniciais?.leadTelefone),
    tipoServico: valoresIniciais?.tipoServico ?? TipoServico.VIAGEM,
    dataContato,
    dataServico,
    precisaNotaFiscal: valoresIniciais?.precisaNotaFiscal ?? false,
    qtdPassageiros: valoresIniciais?.qtdPassageiros ?? 1,
    observacoes: normalizarTextoOpcional(valoresIniciais?.observacoes),
    trajeto:
      trajetoInicial.length > 0
        ? trajetoInicial
        : [criarTrechoPadrao(dataServico ?? dataContato)],
  };
}

function ClienteCombobox({
  clienteId,
  onSelect,
}: {
  clienteId?: string;
  onSelect: (clienteId: string | undefined) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const { data, isFetching } = useClientes({
    busca: busca.trim() || undefined,
    pagina: 1,
    tamanho: 20,
  });

  const clientes = data?.itens ?? [];
  const clienteSelecionado = clientes.find((item) => item.id === clienteId);

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between"
        >
          <span className="truncate">
            {clienteSelecionado?.nome ?? "Selecionar cliente"}
          </span>
          <span className="text-xs text-muted-foreground">Buscar</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[320px] p-0">
        <Command>
          <CommandInput
            placeholder="Buscar cliente por nome"
            value={busca}
            onValueChange={setBusca}
          />
          <CommandList>
            <CommandEmpty>
              {isFetching
                ? "Carregando clientes..."
                : "Nenhum cliente encontrado."}
            </CommandEmpty>
            <CommandGroup>
              {clienteId ? (
                <CommandItem
                  key="limpar"
                  value="limpar"
                  onSelect={() => {
                    onSelect(undefined);
                    setAberto(false);
                  }}
                >
                  Limpar seleção
                </CommandItem>
              ) : null}
              {clientes.map((cliente) => (
                <CommandItem
                  key={cliente.id}
                  value={`${cliente.nome} ${cliente.cpfCnpj}`}
                  onSelect={() => {
                    onSelect(cliente.id);
                    setAberto(false);
                  }}
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate">{cliente.nome}</span>
                    <span className="text-xs text-muted-foreground">
                      {cliente.cpfCnpj}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function SolicitacaoForm({
  modo,
  atendimentoId,
  statusAtual,
  valoresIniciais,
}: SolicitacaoFormProps) {
  const router = useRouter();
  const [confirmacao, setConfirmacao] = useState<AcaoSensivel | null>(null);
  const [emAcao, setEmAcao] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(modo === "criar");

  const valoresPadrao = useMemo(
    () => montarValoresPadrao(valoresIniciais),
    [valoresIniciais],
  );

  const form = useForm<SolicitacaoFormInput, undefined, SolicitacaoFormOutput>({
    resolver: zodResolver(solicitacaoInputSchema),
    mode: "onBlur",
    defaultValues: valoresPadrao,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "trajeto",
  });

  const tipoContatoInicial: TipoContato = valoresPadrao.clienteId
    ? TIPO_CONTATO.CLIENTE
    : TIPO_CONTATO.LEAD;

  const [tipoContato, setTipoContato] =
    useState<TipoContato>(tipoContatoInicial);

  const podeEditarSolicitacao = statusAtual
    ? statusAtual === "EM_SOLICITACAO"
    : true;

  const temVolta = fields.length > 1;

  function abrirConfirmacao(acao: AcaoSensivel) {
    setConfirmacao(acao);
  }

  function fecharConfirmacao() {
    setConfirmacao(null);
  }

  async function salvar(dados: SolicitacaoFormOutput) {
    const dataReferencia = dados.dataServico ?? dados.dataContato;

    const payload: SolicitacaoInput = {
      clienteId:
        tipoContato === TIPO_CONTATO.CLIENTE
          ? normalizarTextoOpcional(dados.clienteId)
          : undefined,
      leadNome:
        tipoContato === TIPO_CONTATO.LEAD
          ? normalizarTextoOpcional(dados.leadNome)
          : undefined,
      leadTelefone:
        tipoContato === TIPO_CONTATO.LEAD
          ? normalizarTextoOpcional(apenasDigitos(dados.leadTelefone ?? ""))
          : undefined,
      tipoServico: dados.tipoServico,
      dataContato: dados.dataContato,
      dataServico: dados.dataServico,
      precisaNotaFiscal: dados.precisaNotaFiscal,
      qtdPassageiros: dados.qtdPassageiros,
      observacoes: normalizarTextoOpcional(dados.observacoes),
      trajeto: dados.trajeto.map((trecho) => ({
        origem: trecho.origem.trim(),
        destino: trecho.destino.trim(),
        hora: trecho.hora,
        data: trecho.data ?? dataReferencia,
        observacoes: normalizarTextoOpcional(trecho.observacoes),
      })),
    };

    setEmAcao(true);
    const resultado =
      modo === "criar"
        ? await criarAtendimento(payload)
        : await atualizarSolicitacao(atendimentoId ?? "", payload);
    setEmAcao(false);

    if (!resultado.success) {
      if (resultado.error.fields) {
        for (const [campo, mensagem] of Object.entries(
          resultado.error.fields,
        )) {
          form.setError(campo as keyof SolicitacaoFormInput, {
            message: mensagem,
          });
        }
      }

      toast.error(resultado.error.message);
      return;
    }

    toast.success(
      modo === "criar"
        ? "Solicitação salva com sucesso."
        : "Solicitação atualizada com sucesso.",
    );

    if (modo === "criar") {
      router.push(`/atendimentos/${resultado.data.id}/solicitacao`);
      return;
    }

    setModoEdicao(false);
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

    if (confirmacao === "cancelarESair") {
      setEmAcao(true);
      const resultado = await cancelarAtendimentoSemSalvar();
      setEmAcao(false);

      if (!resultado.success) {
        toast.error(resultado.error.message);
        return;
      }

      router.push("/atendimentos");
      return;
    }

    if (confirmacao === "encerrar") {
      if (!atendimentoId) {
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

    if (!atendimentoId) {
      return;
    }

    setEmAcao(true);
    const resultado = await avancarEtapa(atendimentoId, { para: "ORCAMENTO" });
    setEmAcao(false);

    if (!resultado.success) {
      toast.error(resultado.error.message);
      return;
    }

    toast.success(
      "Solicitação finalizada. Atendimento enviado para orçamento.",
    );
    router.push(`/atendimentos/${atendimentoId}/orcamento`);
  }

  const tituloConfirmacao: Record<AcaoSensivel, string> = {
    salvar: "Salvar solicitação",
    limpar: "Limpar campos",
    cancelarESair: "Cancelar e sair",
    encerrar: "Encerrar atendimento",
    irOrcamento: "Ir para orçamento",
  };

  const descricaoConfirmacao: Record<AcaoSensivel, string> = {
    salvar: "Deseja salvar os dados da solicitação informada?",
    limpar: "Deseja limpar os campos do formulário?",
    cancelarESair:
      "Deseja cancelar a criação e voltar para a listagem de atendimentos?",
    encerrar:
      "Deseja encerrar este atendimento? O histórico da solicitação será mantido.",
    irOrcamento: "Deseja concluir esta etapa e avançar para o orçamento?",
  };

  return (
    <>
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(salvar)}>
          <Card>
            <CardHeader>
              <CardTitle>Solicitação</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="dataContato"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data do contato</FormLabel>
                    <FormControl>
                      <DateInputBr
                        value={formatarDataBr(field.value)}
                        onValueChange={(valor) => {
                          const data = parseDataBr(valor);
                          field.onChange(data);
                        }}
                        disabled={modo === "editar" && !modoEdicao}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label>Tipo de contato</Label>
                <RadioGroup
                  value={tipoContato}
                  onValueChange={(valor) => {
                    const proximo = valor as TipoContato;
                    setTipoContato(proximo);

                    if (proximo === TIPO_CONTATO.CLIENTE) {
                      form.setValue("leadNome", undefined, {
                        shouldValidate: true,
                      });
                      form.setValue("leadTelefone", undefined, {
                        shouldValidate: true,
                      });
                    } else {
                      form.setValue("clienteId", undefined, {
                        shouldValidate: true,
                      });
                    }
                  }}
                  className="grid gap-2"
                  disabled={modo === "editar" && !modoEdicao}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem
                      id="tipo-contato-cliente"
                      value={TIPO_CONTATO.CLIENTE}
                    />
                    <Label htmlFor="tipo-contato-cliente">
                      Cliente cadastrado
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem
                      id="tipo-contato-lead"
                      value={TIPO_CONTATO.LEAD}
                    />
                    <Label htmlFor="tipo-contato-lead">Lead</Label>
                  </div>
                </RadioGroup>
              </div>

              {tipoContato === TIPO_CONTATO.CLIENTE ? (
                <FormField
                  control={form.control}
                  name="clienteId"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Cliente</FormLabel>
                      <FormControl>
                        <ClienteCombobox
                          clienteId={field.value}
                          onSelect={(clienteId) => field.onChange(clienteId)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="leadNome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do lead</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nome completo"
                            value={field.value ?? ""}
                            onBlur={field.onBlur}
                            onChange={(event) =>
                              field.onChange(
                                normalizarTextoOpcional(event.target.value),
                              )
                            }
                            disabled={modo === "editar" && !modoEdicao}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="leadTelefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone do lead</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Somente números"
                            inputMode="numeric"
                            value={field.value ?? ""}
                            onBlur={field.onBlur}
                            onChange={(event) =>
                              field.onChange(
                                normalizarTextoOpcional(
                                  apenasDigitos(event.target.value).slice(
                                    0,
                                    11,
                                  ),
                                ),
                              )
                            }
                            disabled={modo === "editar" && !modoEdicao}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="tipoServico"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de serviço</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={modo === "editar" && !modoEdicao}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {OPCOES_TIPO_SERVICO.map((opcao) => (
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
                name="qtdPassageiros"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade de passageiros</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        inputMode="numeric"
                        value={
                          typeof field.value === "number" ||
                          typeof field.value === "string"
                            ? field.value
                            : ""
                        }
                        onBlur={field.onBlur}
                        onChange={(event) => {
                          const proximo = Number(event.target.value);
                          field.onChange(
                            Number.isFinite(proximo) ? proximo : undefined,
                          );
                        }}
                        disabled={modo === "editar" && !modoEdicao}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dataServico"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data do serviço</FormLabel>
                    <FormControl>
                      <DateInputBr
                        value={formatarDataBr(field.value)}
                        onValueChange={(valor) => {
                          const data = parseDataBr(valor);
                          field.onChange(data);
                          if (data) {
                            form.setValue("trajeto.0.data", data, {
                              shouldValidate: true,
                            });
                          }
                        }}
                        disabled={modo === "editar" && !modoEdicao}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="precisaNotaFiscal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Necessita NF-e?</FormLabel>
                    <FormControl>
                      <div className="flex h-9 items-center gap-3">
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={modo === "editar" && !modoEdicao}
                        />
                        <span className="text-sm text-muted-foreground">
                          {field.value ? "Sim" : "Não"}
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3 md:col-span-2">
                <div className="flex items-center justify-between">
                  <Label>Trajeto</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={temVolta}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          if (!temVolta) {
                            const dataServicoAtual = form.getValues(
                              "dataServico",
                            ) as Date | undefined;
                            const dataContatoAtual = form.getValues(
                              "dataContato",
                            ) as Date | undefined;

                            append(
                              criarTrechoPadrao(
                                dataServicoAtual ??
                                  dataContatoAtual ??
                                  new Date(),
                              ),
                            );
                          }
                          return;
                        }

                        if (temVolta) {
                          remove(1);
                        }
                      }}
                      disabled={modo === "editar" && !modoEdicao}
                    />
                    <span className="text-sm text-muted-foreground">
                      Tem volta?
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 rounded-md border p-3">
                  <p className="text-sm font-medium">Ida</p>
                  <FormField
                    control={form.control}
                    name="trajeto.0.origem"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Local de saída</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Origem"
                            {...field}
                            disabled={modo === "editar" && !modoEdicao}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="trajeto.0.destino"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destino</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Destino"
                            {...field}
                            disabled={modo === "editar" && !modoEdicao}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="trajeto.0.hora"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horário</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            {...field}
                            disabled={modo === "editar" && !modoEdicao}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {temVolta ? (
                  <div className="grid gap-3 rounded-md border p-3">
                    <p className="text-sm font-medium">Volta</p>
                    <FormField
                      control={form.control}
                      name="trajeto.1.origem"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Local de saída</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Origem"
                              {...field}
                              disabled={modo === "editar" && !modoEdicao}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="trajeto.1.destino"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Destino</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Destino"
                              {...field}
                              disabled={modo === "editar" && !modoEdicao}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="trajeto.1.hora"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horário</FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              {...field}
                              disabled={modo === "editar" && !modoEdicao}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="trajeto.1.data"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data da volta</FormLabel>
                          <FormControl>
                            <DateInputBr
                              value={formatarDataBr(field.value)}
                              onValueChange={(valor) => {
                                const data = parseDataBr(valor);
                                field.onChange(data);
                              }}
                              disabled={modo === "editar" && !modoEdicao}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ) : null}
              </div>

              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Opcional"
                        value={field.value ?? ""}
                        onBlur={field.onBlur}
                        onChange={(event) =>
                          field.onChange(
                            normalizarTextoOpcional(event.target.value),
                          )
                        }
                        disabled={modo === "editar" && !modoEdicao}
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
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {modo === "editar" && !modoEdicao ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={!podeEditarSolicitacao}
                  onClick={() => setModoEdicao(true)}
                >
                  Editar
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    disabled={!form.formState.isValid || emAcao}
                    onClick={() => abrirConfirmacao("salvar")}
                  >
                    Salvar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={emAcao}
                    onClick={() => abrirConfirmacao("limpar")}
                  >
                    Limpar
                  </Button>
                </>
              )}

              <Button
                type="button"
                variant="outline"
                disabled={modo === "editar" || emAcao}
                onClick={() => abrirConfirmacao("cancelarESair")}
              >
                Cancelar e sair
              </Button>

              {modo === "editar" ? (
                <>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={emAcao}
                    onClick={() => abrirConfirmacao("encerrar")}
                  >
                    Encerrar atendimento
                  </Button>

                  <Button
                    type="button"
                    disabled={emAcao || !podeEditarSolicitacao}
                    onClick={() => abrirConfirmacao("irOrcamento")}
                  >
                    Ir para orçamento
                  </Button>
                </>
              ) : null}
            </CardContent>
          </Card>
        </form>
      </Form>

      {modo === "editar" ? (
        <p className="text-sm text-muted-foreground">
          Cancelar e sair está disponível apenas antes do primeiro salvamento.
        </p>
      ) : null}

      <ConfirmDialog
        aberto={Boolean(confirmacao)}
        onAbertoChange={(aberto) => {
          if (!aberto) {
            fecharConfirmacao();
          }
        }}
        titulo={confirmacao ? tituloConfirmacao[confirmacao] : "Confirmar"}
        descricao={
          confirmacao
            ? descricaoConfirmacao[confirmacao]
            : "Confirme a operação."
        }
        textoConfirmar={
          confirmacao === "irOrcamento"
            ? "Ir para orçamento"
            : confirmacao === "encerrar"
              ? "Encerrar"
              : confirmacao === "cancelarESair"
                ? "Cancelar e sair"
                : confirmacao === "limpar"
                  ? "Limpar"
                  : "Salvar"
        }
        varianteConfirmar={
          confirmacao === "encerrar" ? "destructive" : "default"
        }
        carregando={emAcao}
        onConfirmar={executarConfirmacao}
      />
    </>
  );
}
