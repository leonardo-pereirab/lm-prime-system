"use server";

import { revalidatePath } from "next/cache";
import { actionResult } from "@/lib/server-action";
import { requirePerfil, requireSession } from "@/lib/auth";
import {
  funcionarioInputSchema,
  funcionarioUpdateSchema,
} from "@/schemas/funcionario";
import { funcionarioService } from "@/services/funcionarioService";

export async function criarFuncionario(payload: unknown) {
  return actionResult(async () => {
    const session = await requireSession();
    requirePerfil(session, "ADMIN");

    const input = funcionarioInputSchema.parse(payload);
    const funcionario = await funcionarioService.criarConvidado(input);
    revalidatePath("/cadastros/funcionarios");
    return funcionario;
  });
}

export async function atualizarFuncionario(id: string, payload: unknown) {
  return actionResult(async () => {
    const session = await requireSession();
    requirePerfil(session, "ADMIN");

    const input = funcionarioUpdateSchema.parse(payload);
    const funcionario = await funcionarioService.atualizarDadosCriticos(
      id,
      input,
    );
    revalidatePath("/cadastros/funcionarios");
    revalidatePath(`/cadastros/funcionarios/${id}`);
    return funcionario;
  });
}

export async function ativarFuncionario(id: string) {
  return actionResult(async () => {
    const session = await requireSession();
    requirePerfil(session, "ADMIN");

    const funcionario = await funcionarioService.ativar(id);
    revalidatePath("/cadastros/funcionarios");
    revalidatePath(`/cadastros/funcionarios/${id}`);
    return funcionario;
  });
}

export async function inativarFuncionario(id: string) {
  return actionResult(async () => {
    const session = await requireSession();
    requirePerfil(session, "ADMIN");

    const funcionario = await funcionarioService.inativar(id);
    revalidatePath("/cadastros/funcionarios");
    revalidatePath(`/cadastros/funcionarios/${id}`);
    return funcionario;
  });
}

export async function excluirOuAnonimizarFuncionario(id: string) {
  return actionResult(async () => {
    const session = await requireSession();
    requirePerfil(session, "ADMIN");

    const resultado = await funcionarioService.excluirOuAnonimizar(id);
    revalidatePath("/cadastros/funcionarios");
    revalidatePath(`/cadastros/funcionarios/${id}`);
    return resultado;
  });
}
