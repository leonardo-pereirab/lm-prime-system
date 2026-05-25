"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { actionResult } from "@/lib/server-action";
import { usuarioInputSchema, usuarioUpdateSchema } from "@/schemas/usuario";
import { usuarioService } from "@/services/usuarioService";

export async function criarUsuario(payload: unknown) {
  return actionResult(async () => {
    await requireSession();
    const input = usuarioInputSchema.parse(payload);
    const usuario = await usuarioService.criar(input);
    revalidatePath("/usuarios");
    return usuario;
  });
}

export async function atualizarUsuario(id: string, payload: unknown) {
  return actionResult(async () => {
    await requireSession();
    const input = usuarioUpdateSchema.parse(payload);
    const usuario = await usuarioService.atualizar(id, input);
    revalidatePath("/usuarios");
    revalidatePath(`/usuarios/${id}`);
    return usuario;
  });
}

export async function desativarUsuario(id: string) {
  return actionResult(async () => {
    await requireSession();
    const usuario = await usuarioService.desativar(id);
    revalidatePath("/usuarios");
    revalidatePath(`/usuarios/${id}`);
    return usuario;
  });
}

export async function excluirUsuario(id: string) {
  return actionResult(async () => {
    await requireSession();
    await usuarioService.excluir(id);
    revalidatePath("/usuarios");
    return { removido: true };
  });
}
