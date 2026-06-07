"use client";

import {
  FileDown,
  FileText,
  Loader2,
  PlayCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { StatusAtendimento } from "@prisma/client";

import {
  avancarEtapa,
  cancelarAtendimento,
} from "@/app/(admin)/atendimentos/_actions";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { useGerarContrato } from "@/hooks/useContratos";
import { formatarDataHora } from "@/lib/format";

type ContratoItem = {
  id: string;
  nomeArquivo: string;
  geradoEm: Date | string;
  geradoPorUsuario?: {
    id: string;
    nome: string;
    email: string;
  } | null;
};

type ContratoEtapaClientProps = {
  atendimentoId: string;
  contratos: ContratoItem[];
  status: StatusAtendimento;
};

export default function ContratoEtapaClient({
  atendimentoId,
  contratos,
  status,
}: ContratoEtapaClientProps) {
  const router = useRouter();
  const gerarContrato = useGerarContrato();
  const [gerando, setGerando] = useState(false);
  const [emAcao, setEmAcao] = useState(false);
  const [dialogIniciar, setDialogIniciar] = useState(false);
  const [dialogFinalizar, setDialogFinalizar] = useState(false);
  const [dialogEncerrar, setDialogEncerrar] = useState(false);

  const contratoMaisRecente = contratos[0] ?? null;
  const servicoFinalizado = status === "SERVICO_FINALIZADO";

  async function onGerarContrato() {
    setGerando(true);

    try {
      await gerarContrato.mutateAsync({ atendimentoId });
      toast.success("Contrato gerado com sucesso.");
      router.refresh();
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Não foi possível gerar o contrato.";
      toast.error(mensagem);
    } finally {
      setGerando(false);
    }
  }

  async function onIniciarServico() {
    const resultado = await avancarEtapa(atendimentoId, {
      para: "SERVICO_INICIAR",
    });

    if (!resultado.success) {
      toast.error(resultado.error.message);
      return;
    }

    toast.success("Serviço iniciado.");
    router.refresh();
  }

  async function onFinalizarServico() {
    const resultado = await avancarEtapa(atendimentoId, {
      para: "SERVICO_FINALIZAR",
    });

    if (!resultado.success) {
      toast.error(resultado.error.message);
      return;
    }

    toast.success("Serviço finalizado.");
    router.refresh();
  }

  async function onEncerrarAtendimento() {
    setEmAcao(true);
    const resultado = await cancelarAtendimento(atendimentoId, {
      etapa: "RESERVA_CANCELADA",
    });
    setEmAcao(false);

    if (!resultado.success) {
      toast.error(resultado.error.message);
      return;
    }

    toast.success("Atendimento encerrado.");
    router.push("/atendimentos");
  }

  return (
    <div className="space-y-6">
      <ConfirmDialog
        aberto={dialogIniciar}
        onAbertoChange={setDialogIniciar}
        titulo="Iniciar serviço"
        descricao="Confirma o início do serviço? O status será atualizado para 'Serviço em andamento'."
        textoConfirmar="Iniciar serviço"
        onConfirmar={onIniciarServico}
      />

      <ConfirmDialog
        aberto={dialogFinalizar}
        onAbertoChange={setDialogFinalizar}
        titulo="Finalizar serviço"
        descricao="Confirma a finalização do serviço? Esta ação encerra o atendimento e não pode ser desfeita."
        textoConfirmar="Finalizar serviço"
        onConfirmar={onFinalizarServico}
      />

      <ConfirmDialog
        aberto={dialogEncerrar}
        onAbertoChange={setDialogEncerrar}
        titulo="Encerrar atendimento"
        descricao="Deseja encerrar o atendimento nesta etapa? Esta ação não remove registros históricos."
        textoConfirmar="Encerrar atendimento"
        varianteConfirmar="destructive"
        onConfirmar={onEncerrarAtendimento}
      />

      <Card>
        <CardHeader>
          <CardTitle>Ações do contrato</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={onGerarContrato}
            disabled={gerando || servicoFinalizado}
          >
            {gerando ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <FileText className="size-4" />
            )}
            Gerar contrato
          </Button>

          {contratoMaisRecente ? (
            <>
              <Button asChild variant="outline" disabled={gerando}>
                <Link
                  href={`/api/contratos/${contratoMaisRecente.id}/download?disposition=inline`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText className="size-4" />
                  Visualizar PDF
                </Link>
              </Button>

              <Button asChild variant="outline" disabled={gerando}>
                <Link
                  href={`/api/contratos/${contratoMaisRecente.id}/download?disposition=attachment`}
                >
                  <FileDown className="size-4" />
                  Baixar
                </Link>
              </Button>
            </>
          ) : null}

          {status === "ESCALA_DEFINIDA" ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogIniciar(true)}
            >
              <PlayCircle className="size-4" />
              Iniciar serviço
            </Button>
          ) : null}

          {status === "SERVICO_EM_ANDAMENTO" ? (
            <Button type="button" onClick={() => setDialogFinalizar(true)}>
              <CheckCircle className="size-4" />
              Finalizar serviço
            </Button>
          ) : null}

          {status === "ESCALA_DEFINIDA" ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogEncerrar(true)}
              disabled={emAcao}
            >
              <XCircle className="size-4" />
              Encerrar atendimento
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contratos gerados</CardTitle>
        </CardHeader>
        <CardContent>
          {contratos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum contrato foi gerado para este atendimento.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Gerado em</TableHead>
                  <TableHead>Gerado por</TableHead>
                  <TableHead className="w-44 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contratos.map((contrato) => (
                  <TableRow key={contrato.id}>
                    <TableCell className="font-medium">
                      {contrato.nomeArquivo}
                    </TableCell>
                    <TableCell>{formatarDataHora(contrato.geradoEm)}</TableCell>
                    <TableCell>
                      {contrato.geradoPorUsuario?.nome ??
                        "Usuário não identificado"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="ghost" size="sm">
                          <Link
                            href={`/api/contratos/${contrato.id}/download?disposition=inline`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Visualizar
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm">
                          <Link
                            href={`/api/contratos/${contrato.id}/download?disposition=attachment`}
                          >
                            Baixar
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
