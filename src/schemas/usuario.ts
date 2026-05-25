import { PerfilUsuario } from "@prisma/client";
import { z } from "zod";
import { emailSchema } from "./shared";

export const usuarioInputSchema = z.object({
  nome: z.string().trim().min(3, "Nome deve ter ao menos 3 caracteres"),
  email: emailSchema,
  senha: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
  perfil: z.nativeEnum(PerfilUsuario).default("ATENDENTE"),
  ativo: z.boolean().optional(),
});

export type UsuarioInput = z.infer<typeof usuarioInputSchema>;

export const usuarioUpdateSchema = usuarioInputSchema
  .omit({ senha: true })
  .extend({
    senha: z.string().min(6, "Senha deve ter ao menos 6 caracteres").optional(),
  })
  .partial();

export type UsuarioUpdate = z.infer<typeof usuarioUpdateSchema>;
