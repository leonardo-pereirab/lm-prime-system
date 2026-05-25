import { z } from "zod";
import { emailSchema } from "./shared";

export const loginInputSchema = z.object({
  email: emailSchema,
  senha: z.string().min(1, "Senha e obrigatoria"),
});

export type LoginInput = z.infer<typeof loginInputSchema>;
