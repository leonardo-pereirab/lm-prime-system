import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { resolverDashboardPeriodo } from "@/lib/dashboard-periodo";
import { usuarioService } from "@/services/usuarioService";
import { dashboardService } from "@/services/dashboardService";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import DashboardClient from "@/app/(admin)/dashboard/_components/DashboardClient";

type DashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function paraSearchParams(
  query: Record<string, string | string[] | undefined>,
) {
  const params = new URLSearchParams();

  for (const [chave, valor] of Object.entries(query)) {
    if (Array.isArray(valor)) {
      for (const item of valor) {
        params.append(chave, item);
      }
      continue;
    }

    if (typeof valor === "string") {
      params.set(chave, valor);
    }
  }

  return params;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const sessao = await requireSession();
  const usuario = await usuarioService.buscarPorId(sessao.id);
  const query = await searchParams;
  const params = paraSearchParams(query);
  const periodo = resolverDashboardPeriodo(params);
  const indicadores = await dashboardService.obterIndicadores(periodo);

  const dataInicio = params.get("dataInicio") ?? undefined;
  const dataFim = params.get("dataFim") ?? undefined;

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard">
        <p className="mt-2 text-sm text-muted-foreground">
          Ola, {usuario.nome}. Acompanhe os principais indicadores da operacao.
        </p>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="ring-primary/20">
          <CardHeader>
            <CardTitle>Novo atendimento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Registre rapidamente uma nova solicitacao.
            </p>
            <Button asChild size="lg" className="w-full">
              <Link href="/atendimentos/novo">Novo atendimento</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fila de orcamentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Atendimentos aguardando proposta ou aprovacao de orcamento.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/filas/orcamentos">Abrir fila de orcamentos</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fila de reservas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Atendimentos em reserva, escala e servicos proximos.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/filas/reservas">Abrir fila de reservas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <DashboardClient
        indicadorInicial={indicadores}
        periodoInicial={periodo.preset}
        dataInicioInicial={dataInicio}
        dataFimInicial={dataFim}
      />
    </div>
  );
}
