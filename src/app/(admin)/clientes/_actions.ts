"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { actionResult } from "@/lib/server-action";
import { clienteInputSchema, clienteUpdateSchema } from "@/schemas/cliente";
import { clienteService } from "@/services/clienteService";

export async function criarCliente(payload: unknown) {
  return actionResult(async () => {
    await requireSession();
    const input = clienteInputSchema.parse(payload);
    const cliente = await clienteService.criar(input);
    revalidatePath("/clientes");
    return cliente;
  });
}

export async function atualizarCliente(id: string, payload: unknown) {
  return actionResult(async () => {
    await requireSession();
    const input = clienteUpdateSchema.parse(payload);
    const cliente = await clienteService.atualizar(id, input);
    revalidatePath("/clientes");
    revalidatePath(`/clientes/${id}`);
    return cliente;
  });
}

export async function desativarCliente(id: string) {
  return actionResult(async () => {
    await requireSession();
    const cliente = await clienteService.desativar(id);
    revalidatePath("/clientes");
    revalidatePath(`/clientes/${id}`);
    return cliente;
  });
}

export async function ativarCliente(id: string) {
  return actionResult(async () => {
    await requireSession();
    const cliente = await clienteService.ativar(id);
    revalidatePath("/clientes");
    revalidatePath(`/clientes/${id}`);
    return cliente;
  });
}

export async function excluirCliente(id: string) {
  return actionResult(async () => {
    await requireSession();
    const resultado = await clienteService.excluir(id);
    revalidatePath("/clientes");
    revalidatePath(`/clientes/${id}`);
    return resultado;
  });
}
