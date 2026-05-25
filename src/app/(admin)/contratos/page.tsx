import Link from "next/link";

import PageHeader from "@/components/layout/PageHeader";
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
import { formatarData, formatarDataHora } from "@/lib/format";
import { contratoService } from "@/services/contratoService";

export default async function ContratosPage() {
  const contratos = await contratoService.listar({
    pagina: 1,
    tamanho: 50,
    apenasAtivos: true,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Contratos">
        <p className="mt-2 text-sm text-muted-foreground">
          Historico de contratos gerados no sistema.
        </p>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Ultimos contratos</CardTitle>
        </CardHeader>
        <CardContent>
          {contratos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum contrato ativo encontrado.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Atendimento</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data do servico</TableHead>
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
                    <TableCell>
                      <Link
                        href={`/atendimentos/${contrato.atendimentoId}/contrato`}
                        className="text-primary hover:underline"
                      >
                        {contrato.atendimento.codigo ?? contrato.atendimentoId}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {contrato.atendimento.cliente?.nome ??
                        "Cliente nao identificado"}
                    </TableCell>
                    <TableCell>
                      {contrato.atendimento.dataServico
                        ? formatarData(contrato.atendimento.dataServico)
                        : "Nao definida"}
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
