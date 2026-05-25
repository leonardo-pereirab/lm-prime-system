import PageHeader from "@/components/layout/PageHeader";
import OrcamentoForm from "@/components/forms/OrcamentoForm";
import { Card, CardContent } from "@/components/ui/Card";
import { formatarData } from "@/lib/format";

import { buscarAtendimentoComGuardEtapa } from "../_utils/etapasAtendimento";

type PageProps = { params: Promise<{ id: string }> };

export default async function AtendimentoOrcamentoPage({ params }: PageProps) {
  const { id } = await params;
  const atendimento = await buscarAtendimentoComGuardEtapa({
    atendimentoId: id,
    etapa: "orcamento",
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Orcamento">
        <p className="mt-2 text-sm text-muted-foreground">
          Atendimento: {atendimento.codigo ?? atendimento.id}
        </p>
      </PageHeader>

      <details className="rounded-lg border bg-card p-4">
        <summary className="cursor-pointer text-sm font-semibold">
          Resumo da solicitacao
        </summary>
        <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
          <p>
            Contato:{" "}
            {atendimento.cliente?.nome ??
              atendimento.leadNome ??
              "Nao informado"}
          </p>
          <p>Tipo de servico: {atendimento.tipoServico}</p>
          <p>Passageiros: {atendimento.qtdPassageiros}</p>
          <p>Data de contato: {formatarData(atendimento.dataContato)}</p>
          <p>
            Data do servico:{" "}
            {atendimento.dataServico
              ? formatarData(atendimento.dataServico)
              : "Nao definida"}
          </p>
        </div>
      </details>

      <Card>
        <CardContent className="pt-6">
          <OrcamentoForm
            atendimentoId={atendimento.id}
            statusAtual={atendimento.status}
            valoresIniciais={{
              valorTotal: atendimento.orcamento
                ? Number(atendimento.orcamento.valorTotal)
                : undefined,
              formaPagamento: atendimento.orcamento?.formaPagamento,
              dataVencimento:
                atendimento.orcamento?.dataVencimento ?? undefined,
              veiculosPrevistos: Array.isArray(
                atendimento.orcamento?.veiculosPrevistos,
              )
                ? (atendimento.orcamento.veiculosPrevistos as Array<{
                    tipo:
                      | "CARRO_PASSEIO"
                      | "VAN"
                      | "MICRO_ONIBUS"
                      | "ONIBUS"
                      | "OUTRO";
                    quantidade: number;
                  }>)
                : undefined,
              observacoes: atendimento.orcamento?.observacoes ?? undefined,
              validoAte: atendimento.orcamento?.validoAte,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
