"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { actionResult } from "@/lib/server-action";
import {
  motoristaInputSchema,
  motoristaUpdateSchema,
} from "@/schemas/motorista";
import { motoristaService } from "@/services/motoristaService";

export async function criarMotorista(payload: unknown) {
  return actionResult(async () => {
    await requireSession();
    const input = motoristaInputSchema.parse(payload);
    const motorista = await motoristaService.criar(input);
    revalidatePath("/cadastros/motoristas");
    return motorista;
  });
}

export async function atualizarMotorista(id: string, payload: unknown) {
  return actionResult(async () => {
    await requireSession();
    const input = motoristaUpdateSchema.parse(payload);
    const motorista = await motoristaService.atualizar(id, input);
    revalidatePath("/cadastros/motoristas");
    revalidatePath(`/cadastros/motoristas/${id}`);
    return motorista;
  });
}

export async function desativarMotorista(id: string) {
  return actionResult(async () => {
    await requireSession();
    const motorista = await motoristaService.desativar(id);
    revalidatePath("/cadastros/motoristas");
    revalidatePath(`/cadastros/motoristas/${id}`);
    return motorista;
  });
}

export async function ativarMotorista(id: string) {
  return actionResult(async () => {
    await requireSession();
    const motorista = await motoristaService.ativar(id);
    revalidatePath("/cadastros/motoristas");
    revalidatePath(`/cadastros/motoristas/${id}`);
    return motorista;
  });
}

export async function excluirMotorista(id: string) {
  return actionResult(async () => {
    await requireSession();
    await motoristaService.excluir(id);
    revalidatePath("/cadastros/motoristas");
    return { removido: true };
  });
}
