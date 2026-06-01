"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { actionResult } from "@/lib/server-action";
import { contratoService } from "@/services/contratoService";

export async function arquivarContrato(id: string) {
  return actionResult(async () => {
    await requireSession();
    await contratoService.desativar(id);
    revalidatePath("/contratos");
  });
}
