"use client";

import { useRouter } from "next/navigation";

import { criarVeiculo } from "@/app/(admin)/cadastros/veiculos/_actions";
import VeiculoForm from "@/components/forms/VeiculoForm";
import PageHeader from "@/components/layout/PageHeader";

export default function NovoVeiculoPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <PageHeader title="Novo veículo">
        <p className="mt-2 text-sm text-muted-foreground">
          Preencha os dados para cadastrar um novo veículo.
        </p>
      </PageHeader>

      <VeiculoForm
        modo="criar"
        textoBotaoSalvar="Cadastrar veículo"
        onCancelar={() => router.push("/cadastros/veiculos")}
        onSubmit={criarVeiculo}
        onSucesso={(veiculoId) => {
          router.push(`/cadastros/veiculos/${veiculoId}`);
          router.refresh();
        }}
      />
    </div>
  );
}
