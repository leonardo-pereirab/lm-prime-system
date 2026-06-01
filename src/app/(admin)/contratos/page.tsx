import PageHeader from "@/components/layout/PageHeader";
import ContratosListagem from "./_components/ContratosListagem";

export default function ContratosPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Contratos">
        <p className="mt-2 text-sm text-muted-foreground">
          Historico de contratos gerados no sistema.
        </p>
      </PageHeader>

      <ContratosListagem />
    </div>
  );
}
