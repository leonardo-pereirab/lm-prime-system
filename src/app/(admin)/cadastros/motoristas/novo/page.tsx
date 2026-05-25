"use client";

import { useRouter } from "next/navigation";

import { criarMotorista } from "@/app/(admin)/cadastros/motoristas/_actions";
import MotoristaForm from "@/components/forms/MotoristaForm";
import PageHeader from "@/components/layout/PageHeader";

export default function NovoMotoristaPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <PageHeader title="Novo motorista">
        <p className="mt-2 text-sm text-muted-foreground">
          Preencha os dados para cadastrar um novo motorista.
        </p>
      </PageHeader>

      <MotoristaForm
        modo="criar"
        textoBotaoSalvar="Cadastrar motorista"
        onCancelar={() => router.push("/cadastros/motoristas")}
        onSubmit={criarMotorista}
        onSucesso={(motoristaId) => {
          router.push(`/cadastros/motoristas/${motoristaId}`);
          router.refresh();
        }}
      />
    </div>
  );
}
