import { describe, expect, it } from "vitest";
import {
  gerarCodigoAtendimento,
  validarCpf,
  validarCpfCnpj,
} from "@/domain/helpers";

describe("domain/helpers", () => {
  it("deve gerar codigo ATD com sequencia em 5 digitos", () => {
    expect(gerarCodigoAtendimento(2026, 42)).toBe("ATD-2026-00042");
  });

  it("deve validar CPF conhecido como valido", () => {
    expect(validarCpf("11144477735")).toBe(true);
    expect(validarCpfCnpj("11144477735")).toBe(true);
  });

  it("deve rejeitar CPF invalido", () => {
    expect(validarCpf("11111111111")).toBe(false);
    expect(validarCpfCnpj("12345678900")).toBe(false);
  });
});
