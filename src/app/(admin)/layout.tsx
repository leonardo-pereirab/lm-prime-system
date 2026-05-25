import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Toaster } from "@/components/ui/Sonner";
import { requireSession } from "@/lib/auth";
import { usuarioService } from "@/services/usuarioService";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  let usuario: { nome: string; email: string };

  try {
    const sessao = await requireSession();
    const usuarioSessao = await usuarioService.buscarPorId(sessao.id);
    usuario = {
      nome: usuarioSessao.nome,
      email: usuarioSessao.email,
    };
  } catch {
    redirect("/login");
  }

  return (
    <QueryProvider>
      <AppShell usuario={usuario}>{children}</AppShell>
      <Toaster position="bottom-right" richColors />
    </QueryProvider>
  );
}
