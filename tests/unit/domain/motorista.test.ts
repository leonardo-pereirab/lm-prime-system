import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  cnhEstaValida,
  classificarStatusCnh,
  DIAS_ALERTA_CNH,
} from "@/domain/motorista";

describe("regras de cnh do motorista", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-05T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("classificarStatusCnh", () => {
    it("classifica como vencida quando a validade ja passou", () => {
      expect(classificarStatusCnh("2026-06-04")).toBe("VENCIDA");
    });

    it("classifica como vencendo quando vence hoje", () => {
      expect(classificarStatusCnh("2026-06-05")).toBe("VENCENDO");
    });

    it("classifica como vencendo quando vence dentro do periodo de alerta padrao", () => {
      expect(DIAS_ALERTA_CNH).toBe(30);
      expect(classificarStatusCnh("2026-07-05")).toBe("VENCENDO");
    });

    it("classifica como valida quando vence depois do periodo de alerta padrao", () => {
      expect(classificarStatusCnh("2026-07-06")).toBe("VALIDA");
    });

    it("respeita o periodo de alerta informado", () => {
      expect(classificarStatusCnh("2026-06-15", 10)).toBe("VENCENDO");
      expect(classificarStatusCnh("2026-06-16", 10)).toBe("VALIDA");
    });

    it("aceita Date e normaliza a comparacao pelo dia em utc", () => {
      expect(classificarStatusCnh(new Date("2026-06-04T23:59:59.000Z"))).toBe(
        "VENCIDA",
      );
      expect(classificarStatusCnh(new Date("2026-06-05T00:00:00.000Z"))).toBe(
        "VENCENDO",
      );
    });

    it("classifica data invalida como valida", () => {
      expect(classificarStatusCnh("data invalida")).toBe("VALIDA");
    });
  });

  describe("cnhEstaValida", () => {
    it("retorna false apenas para cnh vencida", () => {
      expect(cnhEstaValida("2026-06-04")).toBe(false);
      expect(cnhEstaValida("2026-06-05")).toBe(true);
      expect(cnhEstaValida("2026-07-06")).toBe(true);
      expect(cnhEstaValida("data invalida")).toBe(true);
    });
  });
});
