"use client";

import { FileDown, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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
};

export default function ContratoEtapaClient({
  atendimentoId,
  contratos,
}: ContratoEtapaClientProps) {
  const router = useRouter();
  const gerarContrato = useGerarContrato();
  const [gerando, setGerando] = useState(false);

  const contratoMaisRecente = contratos[0] ?? null;

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
          : "Nao foi possivel gerar o contrato.";
      toast.error(mensagem);
    } finally {
      setGerando(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Acoes do contrato</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button type="button" onClick={onGerarContrato} disabled={gerando}>
            {gerando ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <FileText className="size-4" />
            )}
            Gerar contrato
          </Button>

          {contratoMaisRecente ? (
            <>
              <Button asChild variant="outline">
                <Link
                  href={`/api/contratos/${contratoMaisRecente.id}/download?disposition=inline`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText className="size-4" />
                  Visualizar PDF
                </Link>
              </Button>

              <Button asChild variant="outline">
                <Link
                  href={`/api/contratos/${contratoMaisRecente.id}/download?disposition=attachment`}
                >
                  <FileDown className="size-4" />
                  Baixar
                </Link>
              </Button>
            </>
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
                  <TableHead className="w-44 text-right">Acoes</TableHead>
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
                        "Usuario nao identificado"}
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
