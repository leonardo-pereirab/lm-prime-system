"use client";

import { useRouter } from "next/navigation";

import { criarCliente } from "@/app/(admin)/clientes/_actions";
import ClienteForm from "@/components/forms/ClienteForm";
import PageHeader from "@/components/layout/PageHeader";

export default function NovoClientePage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <PageHeader title="Novo cliente">
        <p className="mt-2 text-sm text-muted-foreground">
          Preencha os dados para cadastrar um novo cliente.
        </p>
      </PageHeader>

      <ClienteForm
        modo="criar"
        textoBotaoSalvar="Cadastrar cliente"
        onCancelar={() => router.push("/clientes")}
        onSubmit={criarCliente}
        onSucesso={(clienteId) => {
          router.push(`/clientes/${clienteId}`);
          router.refresh();
        }}
      />
    </div>
  );
}
