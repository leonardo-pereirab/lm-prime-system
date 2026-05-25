import { TipoServico } from "@prisma/client";
import { z } from "zod";
import { orcamentoInputSchema } from "./orcamento";
import { reservaInputSchema } from "./reserva";
import { escalaInputSchema } from "./escala";
import { idSchema, telefoneSchema } from "./shared";

const horarioSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Horario invalido");

export const trechoSchema = z.object({
  origem: z.string().trim().min(3, "Origem deve ter ao menos 3 caracteres"),
  destino: z.string().trim().min(3, "Destino deve ter ao menos 3 caracteres"),
  data: z.coerce.date(),
  hora: horarioSchema,
  observacoes: z.string().optional(),
});

export const trajetoSchema = z
  .array(trechoSchema)
  .min(1, "Informe ao menos um trecho no trajeto");

const solicitacaoBaseSchema = z.object({
  clienteId: idSchema.optional(),
  leadNome: z
    .string()
    .trim()
    .min(3, "Lead deve ter ao menos 3 caracteres")
    .optional(),
  leadTelefone: telefoneSchema.optional(),
  tipoServico: z.nativeEnum(TipoServico),
  dataContato: z.coerce.date(),
  dataServico: z.coerce.date().optional(),
  precisaNotaFiscal: z.boolean().default(false),
  qtdPassageiros: z
    .number()
    .int()
    .min(1, "Quantidade de passageiros deve ser ao menos 1"),
  trajeto: trajetoSchema,
  observacoes: z.string().optional(),
});

export const solicitacaoInputSchema = solicitacaoBaseSchema.refine(
  (dados) => {
    if (dados.clienteId) return true;
    return Boolean(dados.leadNome && dados.leadTelefone);
  },
  {
    message: "Informe cliente existente ou lead com nome e telefone",
    path: ["clienteId"],
  },
);

export type SolicitacaoInput = z.infer<typeof solicitacaoInputSchema>;

export const atendimentoUpdateSchema = solicitacaoBaseSchema.partial();

export type AtendimentoUpdate = z.infer<typeof atendimentoUpdateSchema>;

export { orcamentoInputSchema, reservaInputSchema, escalaInputSchema };

export type OrcamentoInput = z.infer<typeof orcamentoInputSchema>;
export type ReservaInput = z.infer<typeof reservaInputSchema>;
export type EscalaInput = z.infer<typeof escalaInputSchema>;
