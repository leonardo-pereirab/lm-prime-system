"use client";

import { useMemo } from "react";
import { useDashboard, type DashboardIndicadores } from "@/hooks/useDashboard";
import BreakdownCancelamentos from "@/app/(admin)/dashboard/_components/BreakdownCancelamentos";
import DashboardCards from "@/app/(admin)/dashboard/_components/DashboardCards";
import FiltroPeriodoDashboard from "@/app/(admin)/dashboard/_components/FiltroPeriodoDashboard";
import HistoricoServicos from "@/app/(admin)/dashboard/_components/HistoricoServicos";
import TopRecursos from "@/app/(admin)/dashboard/_components/TopRecursos";

type DashboardClientProps = {
  indicadorInicial: DashboardIndicadores;
  periodoInicial: "7d" | "30d" | "90d" | "mes-atual" | "custom";
  dataInicioInicial?: string;
  dataFimInicial?: string;
};

export default function DashboardClient({
  indicadorInicial,
  periodoInicial,
  dataInicioInicial,
  dataFimInicial,
}: DashboardClientProps) {
  const filtros = useMemo(
    () => ({
      periodo: periodoInicial,
      dataInicio: dataInicioInicial,
      dataFim: dataFimInicial,
    }),
    [dataFimInicial, dataInicioInicial, periodoInicial],
  );

  const { data, isFetching } = useDashboard(filtros);
  const indicadores = data ?? indicadorInicial;

  return (
    <div className="space-y-6">
      <FiltroPeriodoDashboard
        presetInicial={periodoInicial}
        dataInicioInicial={dataInicioInicial}
        dataFimInicial={dataFimInicial}
      />

      {isFetching ? (
        <p className="text-sm text-muted-foreground">
          Atualizando indicadores...
        </p>
      ) : null}

      <DashboardCards indicadores={indicadores} />
      <BreakdownCancelamentos indicadores={indicadores} />
      <TopRecursos indicadores={indicadores} />
      <HistoricoServicos indicadores={indicadores} />
    </div>
  );
}
