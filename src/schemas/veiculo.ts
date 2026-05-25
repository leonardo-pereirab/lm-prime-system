import { TipoVeiculo } from "@prisma/client";
import { z } from "zod";

const anoAtual = new Date().getFullYear();

export const veiculoInputSchema = z.object({
  placa: z
    .string()
    .trim()
    .regex(
      /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$|^[A-Z]{3}[0-9]{4}$/,
      "Placa invalida",
    )
    .transform((valor) => valor.toUpperCase()),
  modelo: z.string().trim().min(2, "Modelo deve ter ao menos 2 caracteres"),
  marca: z.string().trim().min(2, "Marca deve ter ao menos 2 caracteres"),
  ano: z.coerce
    .number()
    .int("Ano deve ser inteiro")
    .min(1970, "Ano invalido")
    .max(anoAtual + 1, "Ano invalido"),
  capacidade: z.coerce
    .number()
    .int("Capacidade deve ser inteira")
    .min(1, "Capacidade minima e 1"),
  tipo: z.nativeEnum(TipoVeiculo),
  ativo: z.boolean().optional(),
  observacoes: z.string().trim().optional(),
});

export type VeiculoInput = z.infer<typeof veiculoInputSchema>;

export const veiculoUpdateSchema = veiculoInputSchema.partial();

export type VeiculoUpdate = z.infer<typeof veiculoUpdateSchema>;
