import { describe, expect, it } from "vitest";

import { formatDate, formatDateTime } from "@/utils/formatDate";

describe("formatDate", () => {
  it("formata Date no padrao brasileiro", () => {
    expect(formatDate(new Date("2026-06-05T12:00:00.000Z"))).toBe("05/06/2026");
  });

  it("aceita string de data", () => {
    expect(formatDate("2026-06-05T12:00:00.000Z")).toBe("05/06/2026");
  });
});

describe("formatDateTime", () => {
  it("formata Date com data e hora no padrao brasileiro", () => {
    const resultado = formatDateTime(new Date("2026-06-05T12:30:00.000Z"));

    expect(resultado).toContain("05/06/2026");
    expect(resultado).toContain("09:30:00");
  });

  it("aceita string de data e hora", () => {
    const resultado = formatDateTime("2026-06-05T12:30:00.000Z");

    expect(resultado).toContain("05/06/2026");
    expect(resultado).toContain("09:30:00");
  });
});
