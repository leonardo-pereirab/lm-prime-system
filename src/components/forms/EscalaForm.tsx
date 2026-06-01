"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { StatusAtendimento, TipoVeiculo } from "@prisma/client";
import { AlertTriangle, Check, ChevronsUpDown, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import {
  salvarEscala,
  cancelarAtendimento,
} from "@/app/(admin)/atendimentos/_actions";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { MoneyInput } from "@/components/forms/MoneyInput";
import { Badge } from "@/components/ui/Badge";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { formatarData } from "@/lib/format";
import { escalaInputSchema } from "@/schemas/escala";

type EscalaFormInput = z.input<typeof escalaInputSchema>;
type EscalaFormOutput = z.output<typeof escalaInputSchema>;

type MotoristaOpcao = {
  id: string;
  nome: string;
  cnhValidade: Date | string;
};

type VeiculoOpcao = {
  id: string;
  modelo: string;
  placa: string;
  tipo: TipoVeiculo;
  capacidade: number;
};

type ParceiroOpcao = {
  id: string;
  nome: string;
};

type EscalaAtual = {
  id: string;
  observacoes: string | null;
  motoristaIds: string[];
  veiculoIds: string[];
  parceiros: Array<{
    parceiroId: string;
    qtdVeiculos: number;
    tipoVeiculo: TipoVeiculo;
    valorRepasse: number;
    observacoes: string | null;
  }>;
};

type EscalaFormProps = {
  atendimentoId: string;
  statusAtual: StatusAtendimento;
  qtdPassageiros: number;
  escala: EscalaAtual | null;
  motoristas: MotoristaOpcao[];
  veiculos: VeiculoOpcao[];
  parceiros: ParceiroOpcao[];
};

type AcaoSensivel = "salvar" | "limpar" | "encerrar";

const TIPOS_VEICULO: Array<{ value: TipoVeiculo; label: string }> = [
  { value: "CARRO_PASSEIO", label: "Carro passeio" },
  { value: "VAN", label: "Van" },
  { value: "MICRO_ONIBUS", label: "Micro-onibus" },
  { value: "ONIBUS", label: "Onibus" },
  { value: "OUTRO", label: "Outro" },
];

function normalizarTexto(valor?: string | null) {
  const texto = valor?.trim();
  return texto ? texto : undefined;
}

function inicioDoDia(data: Date) {
  const normalizada = new Date(data);
  normalizada.setHours(0, 0, 0, 0);
  return normalizada;
}

function cnhVencida(data: Date | string) {
  const validade = new Date(data);
  if (Number.isNaN(validade.getTime())) {
    return false;
  }

  return inicioDoDia(validade) < inicioDoDia(new Date());
}

function montarValoresPadrao(escala: EscalaAtual | null): EscalaFormInput {
  if (!escala) {
    return {
      observacoes: "",
      motoristaIds: [],
      veiculoIds: [],
      parceiros: [],
    };
  }

  return {
    observacoes: escala.observacoes ?? "",
    motoristaIds: escala.motoristaIds,
    veiculoIds: escala.veiculoIds,
    parceiros: escala.parceiros.map((item) => ({
      parceiroId: item.parceiroId,
      qtdVeiculos: item.qtdVeiculos,
      tipoVeiculo: item.tipoVeiculo,
      valorRepasse: item.valorRepasse,
      observacoes: item.observacoes ?? "",
    })),
  };
}

function alterarSelecao(ids: string[], id: string) {
  if (ids.includes(id)) {
    return ids.filter((valor) => valor !== id);
  }

  return [...ids, id];
}

function SeletorMultiplo({
  placeholder,
  buscaPlaceholder,
  selecionados,
  opcoes,
  onToggle,
}: {
  placeholder: string;
  buscaPlaceholder: string;
  selecionados: string[];
  opcoes: Array<{
    id: string;
    rotulo: string;
    descricao?: string;
    destaque?: string;
  }>;
  onToggle: (id: string) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const selecionadosSet = useMemo(() => new Set(selecionados), [selecionados]);

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between"
        >
          <span className="truncate">
            {selecionados.length > 0
              ? `${selecionados.length} selecionado(s)`
              : placeholder}
          </span>
          <ChevronsUpDown className="size-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-90 p-0">
        <Command>
          <CommandInput placeholder={buscaPlaceholder} />
          <CommandList>
            <CommandEmpty>Nenhum resultado.</CommandEmpty>
            <CommandGroup>
              {opcoes.map((opcao) => {
                const marcado = selecionadosSet.has(opcao.id);

                return (
                  <CommandItem
                    key={opcao.id}
                    value={`${opcao.rotulo} ${opcao.descricao ?? ""}`}
                    onSelect={() => onToggle(opcao.id)}
                    data-checked={marcado}
                  >
                    <Check className={marcado ? "opacity-100" : "opacity-0"} />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate">{opcao.rotulo}</span>
                      {opcao.descricao ? (
                        <span className="text-xs text-muted-foreground">
                          {opcao.descricao}
                        </span>
                      ) : null}
                      {opcao.destaque ? (
                        <span className="text-xs text-amber-600">
                          {opcao.destaque}
                        </span>
                      ) : null}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function EscalaForm({
  atendimentoId,
  statusAtual,
  qtdPassageiros,
  escala,
  motoristas,
  veiculos,
  parceiros,
}: EscalaFormProps) {
  const router = useRouter();
  const [confirmacao, setConfirmacao] = useState<AcaoSensivel | null>(null);
  const [emAcao, setEmAcao] = useState(false);
  const [escalaSalva, setEscalaSalva] = useState(Boolean(escala?.id));
  const [modoEdicao, setModoEdicao] = useState(!escala?.id);

  const podeEditar =
    statusAtual === "RESERVA_REGISTRADA_AG_ESCALA" ||
    statusAtual === "ESCALA_DEFINIDA";

  const form = useForm<EscalaFormInput, unknown, EscalaFormOutput>({
    resolver: zodResolver(escalaInputSchema),
    mode: "onChange",
    defaultValues: montarValoresPadrao(escala),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "parceiros",
  });

  const bloqueado = emAcao || !modoEdicao || !podeEditar;

  const motoristasSelecionados = form.watch("motoristaIds") ?? [];
  const veiculosSelecionados = form.watch("veiculoIds") ?? [];

  const mapaMotoristas = useMemo(() => {
    return new Map(motoristas.map((item) => [item.id, item]));
  }, [motoristas]);

  const mapaVeiculos = useMemo(() => {
    return new Map(veiculos.map((item) => [item.id, item]));
  }, [veiculos]);

  const tituloConfirmacao: Record<AcaoSensivel, string> = {
    salvar: "Salvar escala",
    limpar: "Limpar campos",
    encerrar: "Encerrar atendimento",
  };

  const descricaoConfirmacao: Record<AcaoSensivel, string> = {
    salvar: "Deseja salvar as alteracoes da escala?",
    limpar: "Deseja limpar os campos desta etapa?",
    encerrar:
      "Deseja encerrar o atendimento nesta etapa? O status sera RESERVA_CANCELADA.",
  };

  async function onSalvar(dados: EscalaFormOutput) {
    setEmAcao(true);

    const resultado = await salvarEscala(atendimentoId, {
      observacoes: normalizarTexto(dados.observacoes),
      motoristaIds: dados.motoristaIds,
      veiculoIds: dados.veiculoIds,
      parceiros: dados.parceiros.map((item) => ({
        parceiroId: item.parceiroId,
        qtdVeiculos: Number(item.qtdVeiculos),
        tipoVeiculo: item.tipoVeiculo,
        valorRepasse: Number(item.valorRepasse),
        observacoes: normalizarTexto(item.observacoes),
      })),
    });

    setEmAcao(false);

    if (!resultado.success) {
      if (resultado.error.fields) {
        type CampoFormulario = Parameters<typeof form.setError>[0];

        for (const [campo, mensagem] of Object.entries(
          resultado.error.fields,
        )) {
          form.setError(campo as CampoFormulario, { message: mensagem });
        }
      }

      toast.error(resultado.error.message);
      return;
    }

    setEscalaSalva(true);
    setModoEdicao(false);
    toast.success("Escala salva com sucesso.");
    router.refresh();
  }

  async function executarConfirmacao() {
    if (!confirmacao) {
      return;
    }

    if (confirmacao === "salvar") {
      await form.handleSubmit(onSalvar)();
      return;
    }

    if (confirmacao === "limpar") {
      form.reset(montarValoresPadrao(null));
      toast.success("Campos limpos.");
      return;
    }

    setEmAcao(true);
    const resultado = await cancelarAtendimento(atendimentoId, {
      etapa: "RESERVA_CANCELADA",
    });
    setEmAcao(false);

    if (!resultado.success) {
      toast.error(resultado.error.message);
      return;
    }

    toast.success("Atendimento encerrado com status RESERVA_CANCELADA.");
    router.push("/atendimentos");
  }

  return (
    <>
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSalvar)}>
          <Card>
            <CardHeader>
              <CardTitle>Motoristas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <FormField
                control={form.control}
                name="motoristaIds"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <SeletorMultiplo
                        placeholder="Selecionar motoristas"
                        buscaPlaceholder="Buscar motorista"
                        selecionados={field.value ?? []}
                        onToggle={(id) => {
                          if (bloqueado) return;
                          field.onChange(alterarSelecao(field.value ?? [], id));
                        }}
                        opcoes={motoristas.map((motorista) => ({
                          id: motorista.id,
                          rotulo: motorista.nome,
                          descricao: `CNH validade: ${formatarData(motorista.cnhValidade)}`,
                          destaque: cnhVencida(motorista.cnhValidade)
                            ? "CNH vencida"
                            : undefined,
                        }))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {motoristasSelecionados.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {motoristasSelecionados.map((motoristaId) => {
                    const motorista = mapaMotoristas.get(motoristaId);
                    if (!motorista) return null;

                    return (
                      <div
                        key={motoristaId}
                        className="flex items-center gap-2 rounded-lg border px-2 py-1 text-sm"
                      >
                        <span>{motorista.nome}</span>
                        {cnhVencida(motorista.cnhValidade) ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="size-3" />
                            CNH vencida
                          </Badge>
                        ) : null}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => {
                            if (bloqueado) return;
                            form.setValue(
                              "motoristaIds",
                              motoristasSelecionados.filter(
                                (id) => id !== motoristaId,
                              ),
                              { shouldDirty: true, shouldValidate: true },
                            );
                          }}
                          disabled={bloqueado}
                        >
                          <X className="size-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Veiculos proprios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <FormField
                control={form.control}
                name="veiculoIds"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <SeletorMultiplo
                        placeholder="Selecionar veiculos"
                        buscaPlaceholder="Buscar veiculo"
                        selecionados={field.value ?? []}
                        onToggle={(id) => {
                          if (bloqueado) return;
                          field.onChange(alterarSelecao(field.value ?? [], id));
                        }}
                        opcoes={veiculos.map((veiculo) => ({
                          id: veiculo.id,
                          rotulo: `${veiculo.modelo} - ${veiculo.placa}`,
                          descricao: `${veiculo.tipo} | capacidade ${veiculo.capacidade}`,
                          destaque:
                            veiculo.capacidade < qtdPassageiros
                              ? `Capacidade abaixo do sugerido (${qtdPassageiros})`
                              : undefined,
                        }))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {veiculosSelecionados.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {veiculosSelecionados.map((veiculoId) => {
                    const veiculo = mapaVeiculos.get(veiculoId);
                    if (!veiculo) return null;

                    return (
                      <div
                        key={veiculoId}
                        className="flex items-center gap-2 rounded-lg border px-2 py-1 text-sm"
                      >
                        <span>
                          {veiculo.modelo} - {veiculo.placa}
                        </span>
                        {veiculo.capacidade < qtdPassageiros ? (
                          <Badge variant="outline">Capacidade abaixo</Badge>
                        ) : null}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => {
                            if (bloqueado) return;
                            form.setValue(
                              "veiculoIds",
                              veiculosSelecionados.filter(
                                (id) => id !== veiculoId,
                              ),
                              { shouldDirty: true, shouldValidate: true },
                            );
                          }}
                          disabled={bloqueado}
                        >
                          <X className="size-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle>Parceiros (terceirizacao)</CardTitle>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  append({
                    parceiroId: "",
                    qtdVeiculos: 1,
                    tipoVeiculo: "VAN",
                    valorRepasse: 0,
                    observacoes: "",
                  })
                }
                disabled={bloqueado}
              >
                <Plus className="size-4" />
                Adicionar parceiro
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum parceiro adicionado.
                </p>
              ) : null}

              {fields.map((field, indice) => (
                <Card key={field.id}>
                  <CardHeader className="flex flex-row items-center justify-between gap-3">
                    <CardTitle className="text-base">
                      Parceiro #{indice + 1}
                    </CardTitle>
                    <Button
                      type="button"
                      variant="destructive"
                      size="xs"
                      onClick={() => remove(indice)}
                      disabled={bloqueado}
                    >
                      Remover
                    </Button>
                  </CardHeader>
                  <CardContent className="grid gap-3 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`parceiros.${indice}.parceiroId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parceiro</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={bloqueado}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecionar parceiro" />
                              </SelectTrigger>
                              <SelectContent>
                                {parceiros.map((parceiro) => (
                                  <SelectItem
                                    key={parceiro.id}
                                    value={parceiro.id}
                                  >
                                    {parceiro.nome}
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
                      name={`parceiros.${indice}.qtdVeiculos`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantidade de veiculos</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              value={String(field.value ?? 1)}
                              onChange={(event) =>
                                field.onChange(Number(event.target.value || 0))
                              }
                              disabled={bloqueado}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`parceiros.${indice}.tipoVeiculo`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de veiculo</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={bloqueado}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecionar tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                {TIPOS_VEICULO.map((tipo) => (
                                  <SelectItem
                                    key={tipo.value}
                                    value={tipo.value}
                                  >
                                    {tipo.label}
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
                      name={`parceiros.${indice}.valorRepasse`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor de repasse</FormLabel>
                          <FormControl>
                            <MoneyInput
                              value={field.value}
                              onValueChange={(valor) =>
                                field.onChange(valor ?? 0)
                              }
                              disabled={bloqueado}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`parceiros.${indice}.observacoes`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Observacoes</FormLabel>
                          <FormControl>
                            <Input
                              value={String(field.value ?? "")}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              placeholder="Opcional"
                              disabled={bloqueado}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Observacoes da escala</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        rows={4}
                        value={String(field.value ?? "")}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        disabled={bloqueado}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => setConfirmacao("salvar")}
              disabled={emAcao || !modoEdicao || !podeEditar}
            >
              Salvar escala
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmacao("limpar")}
              disabled={emAcao || !modoEdicao || !podeEditar}
            >
              Limpar campos
            </Button>

            {escalaSalva && !modoEdicao ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setModoEdicao(true)}
                disabled={emAcao || !podeEditar}
              >
                Editar escala
              </Button>
            ) : null}

            <Button
              type="button"
              variant="destructive"
              onClick={() => setConfirmacao("encerrar")}
              disabled={emAcao}
            >
              Encerrar atendimento
            </Button>

            <Button type="button" variant="outline" asChild>
              <Link href={`/atendimentos/${atendimentoId}/reserva`}>
                Voltar para reserva
              </Link>
            </Button>

            <Button type="button" asChild>
              <Link href={`/atendimentos/${atendimentoId}/contrato`}>
                Ir para emissao de contrato
              </Link>
            </Button>
          </div>

          {escalaSalva ? (
            <p className="text-sm text-muted-foreground">
              Escala salva com sucesso. Repasses cadastrados podem ser revisados
              na propria etapa.
            </p>
          ) : null}
        </form>
      </Form>

      <ConfirmDialog
        aberto={Boolean(confirmacao)}
        onAbertoChange={(aberto) => {
          if (!aberto) {
            setConfirmacao(null);
          }
        }}
        titulo={confirmacao ? tituloConfirmacao[confirmacao] : ""}
        descricao={confirmacao ? descricaoConfirmacao[confirmacao] : ""}
        textoConfirmar={
          confirmacao === "salvar" ? "Salvar escala" : "Confirmar"
        }
        textoCancelar="Cancelar"
        varianteConfirmar={
          confirmacao === "encerrar" ? "destructive" : "default"
        }
        carregando={emAcao}
        onConfirmar={executarConfirmacao}
      />
    </>
  );
}
