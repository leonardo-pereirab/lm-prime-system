import SolicitacaoForm from "@/components/forms/SolicitacaoForm";
import PageHeader from "@/components/layout/PageHeader";
import { buscarAtendimentoComGuardEtapa } from "../_utils/etapasAtendimento";

type PageProps = { params: Promise<{ id: string }> };

export default async function AtendimentoSolicitacaoPage({
  params,
}: PageProps) {
  const { id } = await params;
  const atendimento = await buscarAtendimentoComGuardEtapa({
    atendimentoId: id,
    etapa: "solicitacao",
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Solicitação">
        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
          <p>Atendimento: {atendimento.codigo ?? atendimento.id}</p>
          <p>Status: {atendimento.status}</p>
        </div>
      </PageHeader>

      <SolicitacaoForm
        modo="editar"
        atendimentoId={atendimento.id}
        statusAtual={atendimento.status}
        valoresIniciais={{
          clienteId: atendimento.clienteId,
          leadNome: atendimento.leadNome,
          leadTelefone: atendimento.leadTelefone,
          tipoServico: atendimento.tipoServico,
          dataContato: atendimento.dataContato,
          dataServico: atendimento.dataServico,
          precisaNotaFiscal: atendimento.precisaNotaFiscal,
          qtdPassageiros: atendimento.qtdPassageiros,
          observacoes: atendimento.observacoes,
          trajeto: Array.isArray(atendimento.trajeto)
            ? (atendimento.trajeto as Array<{
                origem?: string;
                destino?: string;
                hora?: string;
                data?: string;
                observacoes?: string;
              }>)
            : undefined,
        }}
      />
    </div>
  );
}
