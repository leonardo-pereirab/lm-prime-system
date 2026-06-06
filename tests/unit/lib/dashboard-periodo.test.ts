import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { resolverDashboardPeriodo } from "@/lib/dashboard-periodo";

describe("resolverDashboardPeriodo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-06T15:30:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("usa periodo de 30 dias como padrao", () => {
    const periodo = resolverDashboardPeriodo(new URLSearchParams());

    expect(periodo.preset).toBe("30d");
    expect(periodo.inicio).toEqual(new Date("2026-05-07T15:30:00.000Z"));
    expect(periodo.fim).toEqual(new Date("2026-06-06T15:30:00.000Z"));
  });

  it("resolve presets de 7 e 90 dias", () => {
    expect(
      resolverDashboardPeriodo(new URLSearchParams({ periodo: "7d" })).inicio,
    ).toEqual(new Date("2026-05-30T15:30:00.000Z"));
    expect(
      resolverDashboardPeriodo(new URLSearchParams({ periodo: "90d" })).inicio,
    ).toEqual(new Date("2026-03-08T15:30:00.000Z"));
  });

  it("resolve mes atual a partir do primeiro dia do mes", () => {
    const periodo = resolverDashboardPeriodo(
      new URLSearchParams({ periodo: "mes-atual" }),
    );

    expect(periodo.preset).toBe("mes-atual");
    expect(periodo.inicio.getDate()).toBe(1);
    expect(periodo.inicio.getHours()).toBe(0);
  });

  it("resolve periodo customizado valido no inicio e fim do dia", () => {
    const periodo = resolverDashboardPeriodo(
      new URLSearchParams({
        periodo: "custom",
        dataInicio: "2026-06-01",
        dataFim: "2026-06-05",
      }),
    );

    expect(periodo.preset).toBe("custom");
    expect(periodo.inicio.getHours()).toBe(0);
    expect(periodo.fim.getHours()).toBe(23);
    expect(periodo.fim.getMinutes()).toBe(59);
  });

  it("cai no padrao quando periodo customizado e invalido", () => {
    const periodo = resolverDashboardPeriodo(
      new URLSearchParams({
        periodo: "custom",
        dataInicio: "2026-06-05",
        dataFim: "2026-06-01",
      }),
    );

    expect(periodo.preset).toBe("30d");
  });
});
