import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import type { DashboardIndicadores } from "@/hooks/useDashboard";
import { formatarDataHora } from "@/lib/format";

type HistoricoServicosProps = {
  indicadores: DashboardIndicadores;
};

function nomeExibicao(item: DashboardIndicadores["historicoServicos"][number]) {
  return item.cliente?.nome ?? item.leadNome ?? "Lead sem nome";
}

export default function HistoricoServicos({
  indicadores,
}: HistoricoServicosProps) {
  const itens = indicadores.historicoServicos;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de serviços executados</CardTitle>
      </CardHeader>
      <CardContent>
        {itens.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum serviço finalizado no período.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Cliente/Lead</TableHead>
                <TableHead>Data do serviço</TableHead>
                <TableHead>Finalizado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itens.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.codigo ?? item.id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell>{nomeExibicao(item)}</TableCell>
                  <TableCell>
                    {item.dataServico
                      ? formatarDataHora(item.dataServico)
                      : "Não definida"}
                  </TableCell>
                  <TableCell>{formatarDataHora(item.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/atendimentos/${item.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Abrir
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
