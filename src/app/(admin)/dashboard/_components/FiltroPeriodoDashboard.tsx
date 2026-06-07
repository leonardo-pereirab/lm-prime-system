"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { DateRange } from "react-day-picker";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";
import { Calendar } from "@/components/ui/Calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { formatarData } from "@/lib/format";

type DashboardPresetPeriodo = "7d" | "30d" | "90d" | "mes-atual" | "custom";

type FiltroPeriodoDashboardProps = {
  presetInicial: DashboardPresetPeriodo;
  dataInicioInicial?: string;
  dataFimInicial?: string;
};

function formatarDataQuery(data?: Date) {
  if (!data) {
    return undefined;
  }

  return format(data, "yyyy-MM-dd");
}

export default function FiltroPeriodoDashboard({
  presetInicial,
  dataInicioInicial,
  dataFimInicial,
}: FiltroPeriodoDashboardProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [preset, setPreset] = useState<DashboardPresetPeriodo>(presetInicial);
  const [periodoCustom, setPeriodoCustom] = useState<DateRange | undefined>(
    () => ({
      from: dataInicioInicial ? new Date(dataInicioInicial) : undefined,
      to: dataFimInicial ? new Date(dataFimInicial) : undefined,
    }),
  );

  const descricaoPeriodo = useMemo(() => {
    if (periodoCustom?.from && periodoCustom?.to) {
      return `${formatarData(periodoCustom.from)} até ${formatarData(periodoCustom.to)}`;
    }

    if (periodoCustom?.from) {
      return `${formatarData(periodoCustom.from)} até ...`;
    }

    return "Selecionar período";
  }, [periodoCustom?.from, periodoCustom?.to]);

  function aplicarFiltro(
    proximoPreset: DashboardPresetPeriodo,
    range?: DateRange,
  ) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("periodo", proximoPreset);

    if (proximoPreset === "custom") {
      const dataInicio = formatarDataQuery(range?.from);
      const dataFim = formatarDataQuery(range?.to);

      if (dataInicio && dataFim) {
        params.set("dataInicio", dataInicio);
        params.set("dataFim", dataFim);
      }
    } else {
      params.delete("dataInicio");
      params.delete("dataFim");
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtro de período</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <label
            className="text-sm font-medium"
            htmlFor="dashboard-periodo-preset"
          >
            Definição de período
          </label>
          <Select
            value={preset}
            onValueChange={(valor) => {
              const proximo = valor as DashboardPresetPeriodo;
              setPreset(proximo);
              aplicarFiltro(proximo, periodoCustom);
            }}
          >
            <SelectTrigger id="dashboard-periodo-preset" className="w-full">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Ultimos 7 dias</SelectItem>
              <SelectItem value="30d">Ultimos 30 dias</SelectItem>
              <SelectItem value="90d">Ultimos 90 dias</SelectItem>
              <SelectItem value="mes-atual">Ano atual</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Período personalizado</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between font-normal"
              >
                <span className="flex items-center gap-2 truncate">
                  <CalendarIcon className="size-4" />
                  {descricaoPeriodo}
                </span>
                <ChevronDownIcon className="size-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                mode="range"
                numberOfMonths={2}
                selected={periodoCustom}
                onSelect={(valor) => {
                  setPeriodoCustom(valor);

                  if (preset === "custom" && valor?.from && valor?.to) {
                    aplicarFiltro("custom", valor);
                  }
                }}
              />
            </PopoverContent>
          </Popover>
          <p className="text-xs text-muted-foreground">
            Use apenas quando o preset estiver em Personalizado.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
