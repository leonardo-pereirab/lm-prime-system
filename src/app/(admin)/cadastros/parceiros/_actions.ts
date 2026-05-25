"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { actionResult } from "@/lib/server-action";
import { parceiroInputSchema, parceiroUpdateSchema } from "@/schemas/parceiro";
import { parceiroService } from "@/services/parceiroService";

export async function criarParceiro(payload: unknown) {
  return actionResult(async () => {
    await requireSession();
    const input = parceiroInputSchema.parse(payload);
    const parceiro = await parceiroService.criar(input);
    revalidatePath("/cadastros/parceiros");
    return parceiro;
  });
}

export async function atualizarParceiro(id: string, payload: unknown) {
  return actionResult(async () => {
    await requireSession();
    const input = parceiroUpdateSchema.parse(payload);
    const parceiro = await parceiroService.atualizar(id, input);
    revalidatePath("/cadastros/parceiros");
    revalidatePath(`/cadastros/parceiros/${id}`);
    return parceiro;
  });
}

export async function desativarParceiro(id: string) {
  return actionResult(async () => {
    await requireSession();
    const parceiro = await parceiroService.desativar(id);
    revalidatePath("/cadastros/parceiros");
    revalidatePath(`/cadastros/parceiros/${id}`);
    return parceiro;
  });
}

export async function ativarParceiro(id: string) {
  return actionResult(async () => {
    await requireSession();
    const parceiro = await parceiroService.ativar(id);
    revalidatePath("/cadastros/parceiros");
    revalidatePath(`/cadastros/parceiros/${id}`);
    return parceiro;
  });
}

export async function excluirParceiro(id: string) {
  return actionResult(async () => {
    await requireSession();
    await parceiroService.excluir(id);
    revalidatePath("/cadastros/parceiros");
    return { removido: true };
  });
}
