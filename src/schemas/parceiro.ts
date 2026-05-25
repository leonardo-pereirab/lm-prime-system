import { z } from "zod";
import { cepSchema, emailSchema, telefoneSchema } from "./shared";

// TODO(fase-18) Para reativar a validação do algoritmo, descomente o .refine abaixo.
const cnpjSchema = z.string().regex(/^\d{14}$/, "CNPJ deve conter 14 digitos");
// .refine(validarCnpj, "CNPJ invalido");

export const parceiroInputSchema = z.object({
  nome: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres"),
  cnpj: cnpjSchema,
  telefone: telefoneSchema,
  email: emailSchema.optional(),
  cep: cepSchema.optional(),
  logradouro: z.string().trim().optional(),
  numero: z.string().trim().optional(),
  complemento: z.string().trim().optional(),
  bairro: z.string().trim().optional(),
  cidade: z.string().trim().optional(),
  estado: z
    .string()
    .length(2, "Estado deve conter 2 caracteres")
    .transform((valor) => valor.toUpperCase())
    .optional(),
  ativo: z.boolean().optional(),
  observacoes: z.string().trim().optional(),
});

export type ParceiroInput = z.infer<typeof parceiroInputSchema>;

export const parceiroUpdateSchema = parceiroInputSchema.partial();

export type ParceiroUpdate = z.infer<typeof parceiroUpdateSchema>;
