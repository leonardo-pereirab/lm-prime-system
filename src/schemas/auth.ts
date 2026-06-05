import { z } from "zod";
import { emailSchema } from "./shared";

export const loginInputSchema = z.object({
  email: emailSchema,
  senha: z.string().min(1, "Senha e obrigatoria"),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

export const ativacaoValidacaoInputSchema = z.object({
  email: emailSchema,
  matricula: z
    .string()
    .trim()
    .min(3, "Matricula e obrigatoria")
    .max(20, "Matricula invalida"),
});

export type AtivacaoValidacaoInput = z.infer<
  typeof ativacaoValidacaoInputSchema
>;

export const ativacaoConclusaoInputSchema = ativacaoValidacaoInputSchema
  .extend({
    senha: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
    confirmarSenha: z.string().min(8, "Confirmacao de senha e obrigatoria"),
    telefoneAdicional: z
      .string()
      .trim()
      .refine(
        (valor) => valor.length === 0 || /^\d{10,11}$/.test(valor),
        "Telefone adicional deve conter 10 ou 11 digitos",
      )
      .transform((valor) => (valor.length === 0 ? undefined : valor))
      .optional(),
    aceitouTermos: z
      .boolean()
      .refine((valor) => valor, "Aceite dos termos e obrigatorio"),
    versaoTermosAceita: z
      .string()
      .trim()
      .min(1, "Versao dos termos e obrigatoria")
      .default("v1"),
  })
  .refine((dados) => dados.senha === dados.confirmarSenha, {
    message: "As senhas nao conferem",
    path: ["confirmarSenha"],
  });

export type AtivacaoConclusaoInput = z.infer<
  typeof ativacaoConclusaoInputSchema
>;
