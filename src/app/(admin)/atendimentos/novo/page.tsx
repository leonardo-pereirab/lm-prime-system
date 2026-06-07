import SolicitacaoForm from "@/components/forms/SolicitacaoForm";
import PageHeader from "@/components/layout/PageHeader";

export default function NovoAtendimentoPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Novo atendimento">
        <p className="mt-2 text-sm text-muted-foreground">
          Preencha os dados da solicitação e salve para iniciar o atendimento.
        </p>
      </PageHeader>

      <SolicitacaoForm modo="criar" />
    </div>
  );
}
