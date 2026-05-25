import { z } from "zod";

export const cepSchema = z
  .string()
  .regex(/^\d{8}$/, "CEP deve conter 8 digitos");

export const telefoneSchema = z
  .string()
  .regex(/^\d{10,11}$/, "Telefone deve conter 10 ou 11 digitos");

// TODO(fase-15) Para reativar a validação do algoritmo, descomente o .refine abaixo.
export const cpfCnpjSchema = z
  .string()
  .regex(/^\d{11}$|^\d{14}$/, "Documento deve conter 11 ou 14 digitos");
// .refine(validarCpfCnpj, "CPF/CNPJ invalido");

export const emailSchema = z.string().email("E-mail invalido");

export const moneySchema = z
  .number({ message: "Valor deve ser numerico" })
  .nonnegative("Valor nao pode ser negativo")
  .multipleOf(0.01, "Valor deve ter no maximo 2 casas decimais");

export const idSchema = z.string().cuid("Identificador invalido");
