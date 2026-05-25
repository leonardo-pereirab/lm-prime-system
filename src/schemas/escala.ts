import { TipoVeiculo } from "@prisma/client";
import { z } from "zod";
import { idSchema, moneySchema } from "./shared";

export const escalaParceiroSchema = z.object({
  parceiroId: idSchema,
  qtdVeiculos: z
    .number()
    .int("Quantidade deve ser inteira")
    .min(1, "Quantidade minima e 1"),
  tipoVeiculo: z.nativeEnum(TipoVeiculo),
  valorRepasse: moneySchema,
  observacoes: z.string().optional(),
});

const escalaBaseSchema = z.object({
  observacoes: z.string().optional(),
  motoristaIds: z.array(idSchema).default([]),
  veiculoIds: z.array(idSchema).default([]),
  parceiros: z.array(escalaParceiroSchema).default([]),
});

export const escalaInputSchema = escalaBaseSchema.refine(
  (dados) => dados.motoristaIds.length > 0 || dados.parceiros.length > 0,
  {
    message: "Informe ao menos um motorista ou parceiro",
    path: ["motoristaIds"],
  },
);

export type EscalaInput = z.infer<typeof escalaInputSchema>;

export const escalaUpdateSchema = escalaBaseSchema.partial();

export type EscalaUpdate = z.infer<typeof escalaUpdateSchema>;
