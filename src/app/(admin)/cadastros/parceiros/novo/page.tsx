"use client";

import { useRouter } from "next/navigation";

import { criarParceiro } from "@/app/(admin)/cadastros/parceiros/_actions";
import ParceiroForm from "@/components/forms/ParceiroForm";
import PageHeader from "@/components/layout/PageHeader";

export default function NovoParceiroPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <PageHeader title="Novo parceiro">
        <p className="mt-2 text-sm text-muted-foreground">
          Preencha os dados para cadastrar uma empresa parceira.
        </p>
      </PageHeader>

      <ParceiroForm
        modo="criar"
        textoBotaoSalvar="Cadastrar parceiro"
        onCancelar={() => router.push("/cadastros/parceiros")}
        onSubmit={criarParceiro}
        onSucesso={(parceiroId) => {
          router.push(`/cadastros/parceiros/${parceiroId}`);
          router.refresh();
        }}
      />
    </div>
  );
}
