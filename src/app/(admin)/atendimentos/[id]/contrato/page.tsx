import PageHeader from "@/components/layout/PageHeader";
import { contratoService } from "@/services/contratoService";

import { buscarAtendimentoComGuardEtapa } from "../_utils/etapasAtendimento";
import ContratoEtapaClient from "./_components/ContratoEtapaClient";

type PageProps = { params: Promise<{ id: string }> };

export default async function AtendimentoContratoPage({ params }: PageProps) {
  const { id } = await params;
  const [atendimento, contratos] = await Promise.all([
    buscarAtendimentoComGuardEtapa({
      atendimentoId: id,
      etapa: "contrato",
    }),
    contratoService.listarPorAtendimento(id),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Contrato">
        <p className="mt-2 text-sm text-muted-foreground">
          Atendimento: {atendimento.codigo ?? atendimento.id}
        </p>
      </PageHeader>

      <ContratoEtapaClient
        atendimentoId={id}
        contratos={contratos}
        status={atendimento.status}
      />
    </div>
  );
}
