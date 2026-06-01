import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { DashboardIndicadores } from "@/hooks/useDashboard";

type BreakdownCancelamentosProps = {
  indicadores: DashboardIndicadores;
};

const ETAPA_LABELS: Record<string, string> = {
  EM_SOLICITACAO: "Solicitacao",
  AGUARDANDO_ORCAMENTO: "Orcamento",
  ORCAMENTO_REGISTRADO_AG_APROVACAO: "Orcamento",
  AGUARDANDO_RESERVA: "Reserva",
  RESERVA_REGISTRADA_AG_ESCALA: "Escala",
  ESCALA_DEFINIDA: "Escala",
  SERVICO_EM_ANDAMENTO: "Servico",
  SERVICO_FINALIZADO: "Servico",
};

function normalizarPorEtapa(indicadores: DashboardIndicadores) {
  const acumulado = {
    solicitacao: 0,
    orcamento: 0,
    reserva: 0,
    escala: 0,
    servico: 0,
  };

  for (const item of indicadores.cancelamentosPorEtapa) {
    const etapa = item.etapa ? ETAPA_LABELS[item.etapa] : null;

    if (etapa === "Solicitacao") acumulado.solicitacao += item.total;
    if (etapa === "Orcamento") acumulado.orcamento += item.total;
    if (etapa === "Reserva") acumulado.reserva += item.total;
    if (etapa === "Escala") acumulado.escala += item.total;
    if (etapa === "Servico") acumulado.servico += item.total;
  }

  return [
    {
      chave: "solicitacao",
      label: "Solicitacao",
      total: acumulado.solicitacao,
    },
    { chave: "orcamento", label: "Orcamento", total: acumulado.orcamento },
    { chave: "reserva", label: "Reserva", total: acumulado.reserva },
    { chave: "escala", label: "Escala", total: acumulado.escala },
    { chave: "servico", label: "Servico", total: acumulado.servico },
  ];
}

export default function BreakdownCancelamentos({
  indicadores,
}: BreakdownCancelamentosProps) {
  const itens = normalizarPorEtapa(indicadores);
  const maior = Math.max(1, ...itens.map((item) => item.total));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cancelamentos por etapa</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {itens.map((item) => {
          const largura = Math.max(8, Math.round((item.total / maior) * 100));

          return (
            <div key={item.chave} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{item.label}</span>
                <span className="font-medium">{item.total}</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-warning-600/60"
                  style={{ width: `${largura}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
