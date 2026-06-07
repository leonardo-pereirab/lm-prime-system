import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { DashboardIndicadores } from "@/hooks/useDashboard";

function porcentagem(valor: number) {
  return `${(valor * 100).toFixed(1)}%`;
}

type DashboardCardsProps = {
  indicadores: DashboardIndicadores;
};

export default function DashboardCards({ indicadores }: DashboardCardsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Atendimentos no período</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-3xl font-semibold">
            {indicadores.totalAtendimentos}
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs text-muted-foreground">Abertos</p>
              <p className="text-lg font-semibold">
                {indicadores.totais.abertos}
              </p>
            </div>
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs text-muted-foreground">Finalizados</p>
              <p className="text-lg font-semibold">
                {indicadores.totais.finalizados}
              </p>
            </div>
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs text-muted-foreground">Cancelados</p>
              <p className="text-lg font-semibold">
                {indicadores.totais.cancelados}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Taxa de conversão</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          <div className="rounded-md border border-primary/25 bg-primary/5 p-3">
            <p className="text-xs text-muted-foreground">
              Atendimentos feitos → Serviços finalizados
            </p>
            <p className="text-lg font-semibold">
              {porcentagem(indicadores.conversoes.atendimentoParaServico)}
            </p>
          </div>
          <div className="rounded-md bg-muted p-3">
            <p className="text-xs text-muted-foreground">
              Solicitações → Orçamentos
            </p>
            <p className="text-lg font-semibold">
              {porcentagem(indicadores.conversoes.solicitacaoParaOrcamento)}
            </p>
          </div>
          <div className="rounded-md bg-muted p-3">
            <p className="text-xs text-muted-foreground">
              Orçamentos → Reservas
            </p>
            <p className="text-lg font-semibold">
              {porcentagem(indicadores.conversoes.orcamentoParaReserva)}
            </p>
          </div>
          <div className="rounded-md bg-muted p-3">
            <p className="text-xs text-muted-foreground">Reservas → Serviços</p>
            <p className="text-lg font-semibold">
              {porcentagem(indicadores.conversoes.reservaParaServico)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
