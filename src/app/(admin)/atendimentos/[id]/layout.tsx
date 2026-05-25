import type { ReactNode } from "react";
import Link from "next/link";

import { EtapaBloqueadaToast } from "@/components/feedback/EtapaBloqueadaToast";
import Stepper from "@/components/layout/Stepper";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import {
  STATUS_COR,
  STATUS_LABELS,
  etapasParaStatus,
  type StatusCor,
} from "@/domain/status";
import { formatarData, formatarDataHora, formatarMoeda } from "@/lib/format";
import { atendimentoService } from "@/services/atendimentoService";

type AtendimentoLayoutProps = {
  children: ReactNode;
  params: Promise<{ id: string }>;
};

const STATUS_BADGE_CLASSES: Record<StatusCor, string> = {
  neutral: "bg-muted text-foreground",
  info: "bg-info-600/10 text-info-600",
  warning: "bg-warning-600/10 text-warning-600",
  success: "bg-success-600/10 text-success-600",
  danger: "bg-danger-600/10 text-danger-600",
};

type AtendimentoCompleto = Awaited<
  ReturnType<typeof atendimentoService.buscarPorId>
>;

function ResumoSolicitacao({
  atendimento,
}: {
  atendimento: AtendimentoCompleto;
}) {
  const nomeContato =
    atendimento.cliente?.nome ?? atendimento.leadNome ?? "Lead sem nome";

  return (
    <details className="rounded-lg border p-3">
      <summary className="cursor-pointer text-sm font-medium">
        Resumo da solicitacao
      </summary>
      <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
        <p>Contato: {nomeContato}</p>
        <p>Status: {STATUS_LABELS[atendimento.status]}</p>
        <p>Tipo de servico: {atendimento.tipoServico}</p>
        <p>Passageiros: {atendimento.qtdPassageiros}</p>
        <p>Data do contato: {formatarData(atendimento.dataContato)}</p>
        <p>
          Data do servico:{" "}
          {atendimento.dataServico
            ? formatarData(atendimento.dataServico)
            : "Nao definida"}
        </p>
      </div>
    </details>
  );
}

export default async function AtendimentoLayout({
  children,
  params,
}: AtendimentoLayoutProps) {
  const { id } = await params;
  const atendimento = await atendimentoService.buscarPorId(id);
  const corStatus = STATUS_COR[atendimento.status];
  const etapas = etapasParaStatus(
    atendimento.status,
    atendimento.id,
    atendimento.statusAnteriorCancelamento,
  );

  return (
    <div className="space-y-6">
      <EtapaBloqueadaToast />

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/atendimentos"
              className="text-sm text-muted-foreground hover:underline"
            >
              Voltar para atendimentos
            </Link>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm font-semibold">
                {atendimento.codigo ?? atendimento.id}
              </Badge>
              <Badge
                variant="outline"
                className={`gap-2 border-transparent px-2 py-1 text-sm ${STATUS_BADGE_CLASSES[corStatus]}`}
              >
                <span
                  className="size-1.5 rounded-full bg-current"
                  aria-hidden="true"
                />
                {STATUS_LABELS[atendimento.status]}
              </Badge>
            </div>
          </div>

          <Stepper etapas={etapas} />
        </CardHeader>
        <CardContent className="space-y-3 border-t pt-4">
          <ResumoSolicitacao atendimento={atendimento} />

          {atendimento.orcamento ? (
            <details className="rounded-lg border p-3">
              <summary className="cursor-pointer text-sm font-medium">
                Resumo do orcamento
              </summary>
              <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                <p>
                  Valor total:{" "}
                  {formatarMoeda(Number(atendimento.orcamento.valorTotal))}
                </p>
                <p>
                  Forma de pagamento: {atendimento.orcamento.formaPagamento}
                </p>
                <p>
                  Valido ate:{" "}
                  {formatarDataHora(atendimento.orcamento.validoAte)}
                </p>
              </div>
            </details>
          ) : null}

          {atendimento.reserva ? (
            <details className="rounded-lg border p-3">
              <summary className="cursor-pointer text-sm font-medium">
                Resumo da reserva
              </summary>
              <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                <p>
                  Confirmada em:{" "}
                  {formatarDataHora(atendimento.reserva.confirmadaEm)}
                </p>
                <p>
                  Atualizado em:{" "}
                  {formatarDataHora(atendimento.reserva.updatedAt)}
                </p>
              </div>
            </details>
          ) : null}

          {atendimento.escala ? (
            <details className="rounded-lg border p-3">
              <summary className="cursor-pointer text-sm font-medium">
                Resumo da escala
              </summary>
              <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                <p>Motoristas: {atendimento.escala.motoristas.length}</p>
                <p>Veiculos: {atendimento.escala.veiculos.length}</p>
                <p>Parceiros: {atendimento.escala.parceiros.length}</p>
              </div>
            </details>
          ) : null}

          {atendimento.contratos.length > 0 ? (
            <details className="rounded-lg border p-3">
              <summary className="cursor-pointer text-sm font-medium">
                Resumo de contratos
              </summary>
              <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                <p>Contratos ativos: {atendimento.contratos.length}</p>
                <p>
                  Ultimo contrato:{" "}
                  {formatarDataHora(atendimento.contratos[0].geradoEm)}
                </p>
              </div>
            </details>
          ) : null}
        </CardContent>
      </Card>

      <div>{children}</div>
    </div>
  );
}
