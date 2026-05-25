import { z } from "zod";
import { clienteInputSchema } from "./cliente";
import { idSchema } from "./shared";

const reservaBaseSchema = z.object({
  confirmadaEm: z.coerce.date().optional(),
  observacoes: z.string().optional(),
  clienteIdExistente: idSchema.optional(),
  novoCliente: clienteInputSchema.optional(),
});

export const reservaInputSchema = reservaBaseSchema.refine(
  (dados) => Boolean(dados.clienteIdExistente) || Boolean(dados.novoCliente),
  {
    message:
      "Informe um cliente existente ou os dados completos de novo cliente",
    path: ["clienteIdExistente"],
  },
);

export type ReservaInput = z.infer<typeof reservaInputSchema>;

export const reservaUpdateSchema = reservaBaseSchema.partial();

export type ReservaUpdate = z.infer<typeof reservaUpdateSchema>;
