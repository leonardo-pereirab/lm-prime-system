import { describe, expect, it } from "vitest";

import {
  apenasDigitos,
  formatarCep,
  formatarCpfCnpj,
  formatarTelefone,
  gerarCodigoAtendimento,
  validarCnpj,
  validarCpf,
  validarCpfCnpj,
} from "@/domain/helpers";

describe("helpers de dominio", () => {
  describe("gerarCodigoAtendimento", () => {
    it("gera codigo com ano e sequencia preenchida com zeros", () => {
      expect(gerarCodigoAtendimento(2026, 1)).toBe("ATD-2026-00001");
      expect(gerarCodigoAtendimento(2026, 42)).toBe("ATD-2026-00042");
      expect(gerarCodigoAtendimento(2026, 12345)).toBe("ATD-2026-12345");
    });

    it("mantem sequencias maiores que o tamanho minimo", () => {
      expect(gerarCodigoAtendimento(2026, 123456)).toBe("ATD-2026-123456");
    });
  });

  describe("apenasDigitos", () => {
    it("remove qualquer caractere que nao seja digito", () => {
      expect(apenasDigitos("CPF 529.982.247-25")).toBe("52998224725");
      expect(apenasDigitos("(11) 98765-4321")).toBe("11987654321");
      expect(apenasDigitos("sem digitos")).toBe("");
    });
  });

  describe("validarCpf", () => {
    it("aceita cpf valido com ou sem mascara", () => {
      expect(validarCpf("529.982.247-25")).toBe(true);
      expect(validarCpf("52998224725")).toBe(true);
    });

    it("rejeita cpf com tamanho invalido, digitos repetidos ou digito verificador incorreto", () => {
      expect(validarCpf("5299822472")).toBe(false);
      expect(validarCpf("111.111.111-11")).toBe(false);
      expect(validarCpf("529.982.247-26")).toBe(false);
    });
  });

  describe("validarCnpj", () => {
    it("aceita cnpj valido com ou sem mascara", () => {
      expect(validarCnpj("11.222.333/0001-81")).toBe(true);
      expect(validarCnpj("11222333000181")).toBe(true);
    });

    it("rejeita cnpj com tamanho invalido, digitos repetidos ou digito verificador incorreto", () => {
      expect(validarCnpj("1122233300018")).toBe(false);
      expect(validarCnpj("11.111.111/1111-11")).toBe(false);
      expect(validarCnpj("11.222.333/0001-82")).toBe(false);
    });
  });

  describe("validarCpfCnpj", () => {
    it("valida documento de acordo com a quantidade de digitos", () => {
      expect(validarCpfCnpj("529.982.247-25")).toBe(true);
      expect(validarCpfCnpj("11.222.333/0001-81")).toBe(true);
      expect(validarCpfCnpj("123456")).toBe(false);
    });
  });

  describe("formatarCpfCnpj", () => {
    it("formata cpf e cnpj validos pelo tamanho do documento", () => {
      expect(formatarCpfCnpj("52998224725")).toBe("529.982.247-25");
      expect(formatarCpfCnpj("11222333000181")).toBe("11.222.333/0001-81");
    });

    it("retorna o valor original quando o tamanho nao corresponde a cpf ou cnpj", () => {
      expect(formatarCpfCnpj("123456")).toBe("123456");
      expect(formatarCpfCnpj("documento invalido")).toBe("documento invalido");
    });
  });

  describe("formatarCep", () => {
    it("formata cep com oito digitos", () => {
      expect(formatarCep("12345678")).toBe("12345-678");
      expect(formatarCep("12.345-678")).toBe("12345-678");
    });

    it("retorna o valor original quando o cep nao tem oito digitos", () => {
      expect(formatarCep("1234567")).toBe("1234567");
      expect(formatarCep("cep invalido")).toBe("cep invalido");
    });
  });

  describe("formatarTelefone", () => {
    it("formata telefone fixo e celular pelo tamanho", () => {
      expect(formatarTelefone("1133334444")).toBe("(11) 3333-4444");
      expect(formatarTelefone("11987654321")).toBe("(11) 98765-4321");
    });

    it("retorna o valor original quando o telefone nao tem tamanho esperado", () => {
      expect(formatarTelefone("12345")).toBe("12345");
      expect(formatarTelefone("telefone invalido")).toBe("telefone invalido");
    });
  });
});
