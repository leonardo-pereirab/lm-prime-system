import { z } from "zod";
import {
  cepSchema,
  cpfCnpjSchema,
  emailSchema,
  telefoneSchema,
} from "./shared";

const opcionalQuandoVazio = <TSchema extends z.ZodString>(schema: TSchema) =>
  z
    .union([schema, z.literal("")])
    .transform((valor) => (valor === "" ? undefined : valor))
    .optional();

export const clienteInputSchema = z.object({
  nome: z.string().trim().min(3, "Nome deve ter ao menos 3 caracteres"),
  cpfCnpj: cpfCnpjSchema,
  rgIe: z.string().optional(),
  telefone: telefoneSchema,
  telefoneSec: opcionalQuandoVazio(telefoneSchema),
  email: opcionalQuandoVazio(emailSchema),
  cep: cepSchema.optional(),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z
    .string()
    .length(2, "Estado deve conter 2 caracteres")
    .transform((valor) => valor.toUpperCase())
    .optional(),
  ativo: z.boolean().optional(),
  observacoes: z.string().optional(),
});

export type ClienteInput = z.infer<typeof clienteInputSchema>;

export const clienteUpdateSchema = clienteInputSchema.partial();

export type ClienteUpdate = z.infer<typeof clienteUpdateSchema>;
