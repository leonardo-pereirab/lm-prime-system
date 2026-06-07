import Link from "next/link";

import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  STATUS_LABELS,
  etapasParaStatus,
  type EtapaVisualStatus,
} from "@/domain/status";
import { formatarDataHora } from "@/lib/format";
import { atendimentoService } from "@/services/atendimentoService";

type PageProps = { params: Promise<{ id: string }> };

export default async function AtendimentoDetalhe({ params }: PageProps) {
  const { id } = await params;
  const atendimento = await atendimentoService.buscarPorId(id);
  const etapas = etapasParaStatus(
    atendimento.status,
    atendimento.id,
    atendimento.statusAnteriorCancelamento,
  );

  const etapaAtual =
    etapas.find((etapa) => etapa.status === "atual") ??
    etapas.find((etapa) => etapa.status === "cancelada") ??
    etapas[0];

  return (
    <div className="space-y-6">
      <PageHeader title="Visão geral do atendimento">
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant="outline">
            {atendimento.codigo ?? atendimento.id}
          </Badge>
          <Badge variant="outline">{STATUS_LABELS[atendimento.status]}</Badge>
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumo rápido</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
          <p>
            Contato registrado em: {formatarDataHora(atendimento.dataContato)}
          </p>
          <p>
            Cliente/lead:{" "}
            {atendimento.cliente?.nome ??
              atendimento.leadNome ??
              "Não informado"}
          </p>
          <p>Tipo de serviço: {atendimento.tipoServico}</p>
          <p>Última atualização: {formatarDataHora(atendimento.updatedAt)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Etapas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {etapas.map((etapa) => {
            const liberada =
              etapa.status === "concluida" || etapa.status === "atual";

            return (
              <div
                key={etapa.href}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{etapa.label}</span>
                  <Badge variant="outline" className="text-xs">
                    {statusEtapaTexto(etapa.status)}
                  </Badge>
                </div>

                {liberada ? (
                  <Link
                    href={etapa.href}
                    className="text-sm text-primary hover:underline"
                  >
                    Abrir etapa
                  </Link>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Indisponível
                  </span>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Próximo passo</CardTitle>
        </CardHeader>
        <CardContent>
          <Link
            href={etapaAtual.href}
            className="text-sm font-medium text-primary hover:underline"
          >
            Ir para {etapaAtual.label}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function statusEtapaTexto(status: EtapaVisualStatus) {
  if (status === "concluida") {
    return "Concluída";
  }

  if (status === "atual") {
    return "Atual";
  }

  if (status === "pendente") {
    return "Pendente";
  }

  if (status === "cancelada") {
    return "Cancelada";
  }

  return "Bloqueada";
}
