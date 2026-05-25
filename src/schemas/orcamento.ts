import { FormaPagamento, TipoVeiculo } from "@prisma/client";
import { z } from "zod";
import { moneySchema } from "./shared";

export const veiculoPrevistoSchema = z.object({
  tipo: z.nativeEnum(TipoVeiculo),
  quantidade: z
    .number()
    .int("Quantidade deve ser inteira")
    .min(1, "Quantidade minima e 1"),
});

export const orcamentoInputSchema = z.object({
  valorTotal: moneySchema,
  formaPagamento: z.nativeEnum(FormaPagamento),
  dataVencimento: z.coerce.date().optional(),
  veiculosPrevistos: z
    .array(veiculoPrevistoSchema)
    .min(1, "Informe ao menos um veiculo previsto"),
  observacoes: z.string().optional(),
});

export type OrcamentoInput = z.infer<typeof orcamentoInputSchema>;

export const orcamentoUpdateSchema = orcamentoInputSchema.partial();

export type OrcamentoUpdate = z.infer<typeof orcamentoUpdateSchema>;
