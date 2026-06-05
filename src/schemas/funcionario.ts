import { ClassificacaoFuncionario, EstadoFuncionario } from "@prisma/client";
import { z } from "zod";
import { cepSchema, emailSchema, telefoneSchema } from "./shared";

const cpfSchema = z.string().regex(/^\d{11}$/, "CPF deve conter 11 digitos");

export const funcionarioInputSchema = z.object({
  nomeCompleto: z
    .string()
    .trim()
    .min(3, "Nome completo deve ter ao menos 3 caracteres"),
  emailCorporativo: emailSchema,
  cpf: cpfSchema,
  telefonePrincipal: telefoneSchema,
  classificacao: z
    .nativeEnum(ClassificacaoFuncionario)
    .default(ClassificacaoFuncionario.ATENDENTE),
  cep: cepSchema,
  logradouro: z.string().trim().min(3, "Logradouro e obrigatorio"),
  numero: z.string().trim().min(1, "Numero e obrigatorio"),
  complemento: z.string().trim().optional(),
  bairro: z.string().trim().min(2, "Bairro e obrigatorio"),
  cidade: z.string().trim().min(2, "Cidade e obrigatoria"),
  estadoUf: z.string().trim().length(2, "UF deve conter 2 caracteres"),
});

export type FuncionarioInput = z.infer<typeof funcionarioInputSchema>;

export const funcionarioUpdateSchema = funcionarioInputSchema.partial();

export type FuncionarioUpdate = z.infer<typeof funcionarioUpdateSchema>;

export const funcionarioEstadoSchema = z.object({
  estado: z.nativeEnum(EstadoFuncionario),
});

export type FuncionarioEstadoInput = z.infer<typeof funcionarioEstadoSchema>;
