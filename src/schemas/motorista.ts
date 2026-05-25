import { z } from "zod";
import { telefoneSchema } from "./shared";

const cpfSchema = z.string().regex(/^\d{11}$/, "CPF deve conter 11 digitos");

function converterDataBrParaDate(valor: unknown) {
  if (valor instanceof Date) {
    return valor;
  }

  if (typeof valor !== "string") {
    return valor;
  }

  const texto = valor.trim();

  if (!texto) {
    return valor;
  }

  const match = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!match) {
    return valor;
  }

  const [, diaTexto, mesTexto, anoTexto] = match;
  const dia = Number(diaTexto);
  const mes = Number(mesTexto);
  const ano = Number(anoTexto);
  const data = new Date(Date.UTC(ano, mes - 1, dia));

  if (
    data.getUTCFullYear() !== ano ||
    data.getUTCMonth() !== mes - 1 ||
    data.getUTCDate() !== dia
  ) {
    return valor;
  }

  return data;
}

export const motoristaInputSchema = z.object({
  nome: z.string().trim().min(3, "Nome deve ter ao menos 3 caracteres"),
  telefone: telefoneSchema,
  cpf: cpfSchema,
  cnh: z.string().trim().min(5, "CNH invalida"),
  cnhCategoria: z.enum(["A", "B", "C", "D", "E"]),
  cnhValidade: z.preprocess(
    converterDataBrParaDate,
    z.coerce.date({ message: "Data de validade invalida" }),
  ),
  ativo: z.boolean().optional(),
  observacoes: z.string().optional(),
});

export type MotoristaInput = z.infer<typeof motoristaInputSchema>;

export const motoristaUpdateSchema = motoristaInputSchema.partial();

export type MotoristaUpdate = z.infer<typeof motoristaUpdateSchema>;
