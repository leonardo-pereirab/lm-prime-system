"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { actionResult } from "@/lib/server-action";
import { veiculoInputSchema, veiculoUpdateSchema } from "@/schemas/veiculo";
import { veiculoService } from "@/services/veiculoService";

export async function criarVeiculo(payload: unknown) {
  return actionResult(async () => {
    await requireSession();
    const input = veiculoInputSchema.parse(payload);
    const veiculo = await veiculoService.criar(input);
    revalidatePath("/cadastros/veiculos");
    return veiculo;
  });
}

export async function atualizarVeiculo(id: string, payload: unknown) {
  return actionResult(async () => {
    await requireSession();
    const input = veiculoUpdateSchema.parse(payload);
    const veiculo = await veiculoService.atualizar(id, input);
    revalidatePath("/cadastros/veiculos");
    revalidatePath(`/cadastros/veiculos/${id}`);
    return veiculo;
  });
}

export async function desativarVeiculo(id: string) {
  return actionResult(async () => {
    await requireSession();
    const veiculo = await veiculoService.desativar(id);
    revalidatePath("/cadastros/veiculos");
    revalidatePath(`/cadastros/veiculos/${id}`);
    return veiculo;
  });
}

export async function ativarVeiculo(id: string) {
  return actionResult(async () => {
    await requireSession();
    const veiculo = await veiculoService.ativar(id);
    revalidatePath("/cadastros/veiculos");
    revalidatePath(`/cadastros/veiculos/${id}`);
    return veiculo;
  });
}

export async function excluirVeiculo(id: string) {
  return actionResult(async () => {
    await requireSession();
    await veiculoService.excluir(id);
    revalidatePath("/cadastros/veiculos");
    return { removido: true };
  });
}
