"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { StatusAtendimento } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import {
  avancarEtapa,
  cancelarAtendimento,
  cancelarReserva,
  salvarReserva,
} from "@/app/(admin)/atendimentos/_actions";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import LeadParaClienteForm from "@/components/forms/LeadParaClienteForm";
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
import { Textarea } from "@/components/ui/Textarea";
import { apenasDigitos } from "@/domain/helpers";
import {
  formatarCpfCnpj,
  formatarDataHora,
  formatarTelefoneBr,
} from "@/lib/format";
import { reservaInputSchema } from "@/schemas/reserva";

type ClienteResumo = {
  id: string;
  nome: string;
  cpfCnpj: string;
  telefone: string;
  telefoneSec: string | null;
  email: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
};

type ReservaResumo = {
  id: string;
  confirmadaEm: Date;
  observacoes: string | null;
};

type ReservaFormInput = z.input<typeof reservaInputSchema>;
type ReservaFormOutput = z.output<typeof reservaInputSchema>;

type ReservaFormProps = {
  atendimentoId: string;
  statusAtual: StatusAtendimento;
  cliente: ClienteResumo | null;
  leadNome?: string | null;
  leadTelefone?: string | null;
  reserva: ReservaResumo | null;
};

type AcaoSensivel =
  | "salvar"
  | "limpar"
  | "cancelarReserva"
  | "encerrar"
  | "irEscala";

function normalizarTexto(valor?: string) {
  const texto = valor?.trim();
  return texto ? texto : undefined;
}

function montarValoresPadrao({
  cliente,
  leadNome,
  leadTelefone,
  reserva,
}: Pick<
  ReservaFormProps,
  "cliente" | "leadNome" | "leadTelefone" | "reserva"
>): ReservaFormInput {
  if (cliente) {
    return {
      clienteIdExistente: cliente.id,
      observacoes: reserva?.observacoes ?? "",
    };
  }

  return {
    observacoes: reserva?.observacoes ?? "",
    novoCliente: {
      nome: leadNome ?? "",
      cpfCnpj: "",
      rgIe: "",
      telefone: apenasDigitos(leadTelefone ?? ""),
      telefoneSec: "",
      email: "",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      ativo: true,
      observacoes: "",
    },
  };
}

export default function ReservaForm({
  atendimentoId,
  statusAtual,
  cliente,
  leadNome,
  leadTelefone,
  reserva,
}: ReservaFormProps) {
  const router = useRouter();
  const [confirmacao, setConfirmacao] = useState<AcaoSensivel | null>(null);
  const [emAcao, setEmAcao] = useState(false);
  const [reservaSalva, setReservaSalva] = useState(Boolean(reserva?.id));
  const [modoEdicao, setModoEdicao] = useState(!reserva?.id);

  const podeEditar =
    statusAtual === "AGUARDANDO_RESERVA" ||
    statusAtual === "RESERVA_REGISTRADA_AG_ESCALA";

  const form = useForm<ReservaFormInput, unknown, ReservaFormOutput>({
    resolver: zodResolver(reservaInputSchema),
    mode: "onChange",
    defaultValues: montarValoresPadrao({
      cliente,
      leadNome,
      leadTelefone,
      reserva,
    }),
  });

  const bloqueado = emAcao || !modoEdicao || !podeEditar;
  const possuiCliente = Boolean(cliente?.id);
  const podeIrEscala = useMemo(
    () => reservaSalva && !emAcao,
    [emAcao, reservaSalva],
  );

  function abrirConfirmacao(acao: AcaoSensivel) {
    setConfirmacao(acao);
  }

  function fecharConfirmacao() {
    setConfirmacao(null);
  }

  async function salvar(dados: ReservaFormOutput) {
    const payload = possuiCliente
      ? {
          clienteIdExistente: cliente?.id,
          observacoes: normalizarTexto(dados.observacoes),
        }
      : {
          observacoes: normalizarTexto(dados.observacoes),
          novoCliente: dados.novoCliente
            ? {
                nome: dados.novoCliente.nome.trim(),
                cpfCnpj: apenasDigitos(dados.novoCliente.cpfCnpj),
                rgIe: normalizarTexto(dados.novoCliente.rgIe),
                telefone: apenasDigitos(dados.novoCliente.telefone),
                telefoneSec: normalizarTexto(
                  apenasDigitos(dados.novoCliente.telefoneSec ?? ""),
                ),
                email: normalizarTexto(dados.novoCliente.email),
                cep: normalizarTexto(
                  apenasDigitos(dados.novoCliente.cep ?? ""),
                ),
                logradouro: normalizarTexto(dados.novoCliente.logradouro),
                numero: normalizarTexto(dados.novoCliente.numero),
                complemento: normalizarTexto(dados.novoCliente.complemento),
                bairro: normalizarTexto(dados.novoCliente.bairro),
                cidade: normalizarTexto(dados.novoCliente.cidade),
                estado: normalizarTexto(dados.novoCliente.estado),
                ativo: true,
                observacoes: normalizarTexto(dados.novoCliente.observacoes),
              }
            : undefined,
        };

    setEmAcao(true);
    const resultado = await salvarReserva(atendimentoId, payload);
    setEmAcao(false);

    if (!resultado.success) {
      if (resultado.error.fields) {
        for (const [campo, mensagem] of Object.entries(
          resultado.error.fields,
        )) {
          form.setError(campo as keyof ReservaFormInput, {
            message: mensagem,
          });
        }
      }

      toast.error(resultado.error.message);
      return;
    }

    setReservaSalva(true);
    setModoEdicao(false);
    toast.success("Reserva confirmada com sucesso.");
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
      form.reset(
        montarValoresPadrao({
          cliente,
          leadNome,
          leadTelefone,
          reserva: null,
        }),
      );
      toast.success("Campos limpos.");
      return;
    }

    if (confirmacao === "cancelarReserva") {
      setEmAcao(true);
      const resultado = await cancelarReserva(atendimentoId);
      setEmAcao(false);

      if (!resultado.success) {
        toast.error(resultado.error.message);
        return;
      }

      toast.success("Reserva cancelada com sucesso.");
      router.push("/atendimentos");
      return;
    }

    if (confirmacao === "encerrar") {
      if (reservaSalva) {
        setEmAcao(true);
        const resultado = await cancelarReserva(atendimentoId);
        setEmAcao(false);

        if (!resultado.success) {
          toast.error(resultado.error.message);
          return;
        }

        toast.success("Atendimento encerrado com cancelamento de reserva.");
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
    const resultado = await avancarEtapa(atendimentoId, { para: "ESCALA" });
    setEmAcao(false);

    if (!resultado.success) {
      toast.error(resultado.error.message);
      return;
    }

    router.push(`/atendimentos/${atendimentoId}/escala`);
  }

  const tituloConfirmacao: Record<AcaoSensivel, string> = {
    salvar: "Confirmar reserva",
    limpar: "Limpar campos",
    cancelarReserva: "Cancelar reserva",
    encerrar: "Encerrar atendimento",
    irEscala: "Ir para escala",
  };

  const descricaoConfirmacao: Record<AcaoSensivel, string> = {
    salvar: "Deseja confirmar a reserva com os dados informados?",
    limpar: "Deseja limpar os campos desta etapa?",
    cancelarReserva:
      "Deseja cancelar esta reserva? O atendimento sera marcado como RESERVA_CANCELADA.",
    encerrar:
      "Deseja encerrar o atendimento nesta etapa? Esta acao nao remove o historico.",
    irEscala: "Deseja seguir para a etapa de escala?",
  };

  return (
    <>
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(salvar)}>
          {cliente ? (
            <Card>
              <CardHeader>
                <CardTitle>Cliente</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                <p>Nome: {cliente.nome}</p>
                <p>Documento: {formatarCpfCnpj(cliente.cpfCnpj)}</p>
                <p>Telefone: {formatarTelefoneBr(cliente.telefone)}</p>
                {cliente.telefoneSec ? (
                  <p>
                    Telefone secundario:{" "}
                    {formatarTelefoneBr(cliente.telefoneSec)}
                  </p>
                ) : null}
                {cliente.email ? <p>E-mail: {cliente.email}</p> : null}
                {cliente.cidade || cliente.estado ? (
                  <p>
                    Cidade/UF: {cliente.cidade ?? ""}
                    {cliente.cidade && cliente.estado ? " - " : ""}
                    {cliente.estado ?? ""}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Completar cadastro do cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <LeadParaClienteForm
                  control={form.control}
                  register={form.register}
                  setValue={form.setValue}
                  disabled={bloqueado}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="space-y-2">
              <CardTitle>Reserva</CardTitle>
              {reserva ? (
                <p className="text-sm text-muted-foreground">
                  Confirmada em {formatarDataHora(reserva.confirmadaEm)}
                </p>
              ) : null}
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observacoes da reserva</FormLabel>
                    <FormControl>
                      <Textarea
                        value={String(field.value ?? "")}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
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

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => abrirConfirmacao("salvar")}
              disabled={emAcao || !modoEdicao || !podeEditar}
            >
              Confirmar reserva
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => abrirConfirmacao("limpar")}
              disabled={emAcao || !modoEdicao || !podeEditar}
            >
              Limpar
            </Button>
            {reservaSalva && !modoEdicao ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setModoEdicao(true)}
                disabled={emAcao || !podeEditar}
              >
                Editar
              </Button>
            ) : null}
            <Button
              type="button"
              variant="destructive"
              onClick={() => abrirConfirmacao("cancelarReserva")}
              disabled={emAcao || !reservaSalva}
            >
              Cancelar reserva
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => abrirConfirmacao("encerrar")}
              disabled={emAcao}
            >
              Encerrar atendimento
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href={`/atendimentos/${atendimentoId}/orcamento`}>
                Voltar para orcamento
              </Link>
            </Button>
            <Button
              type="button"
              onClick={() => abrirConfirmacao("irEscala")}
              disabled={!podeIrEscala}
            >
              Ir para escala
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
          confirmacao === "salvar"
            ? "Confirmar reserva"
            : confirmacao === "irEscala"
              ? "Ir para escala"
              : "Confirmar"
        }
        textoCancelar="Cancelar"
        varianteConfirmar={
          confirmacao === "cancelarReserva" || confirmacao === "encerrar"
            ? "destructive"
            : "default"
        }
        carregando={emAcao}
        onConfirmar={executarConfirmacao}
      />
    </>
  );
}
