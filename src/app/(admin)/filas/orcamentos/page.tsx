import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import FilaAtendimentoCard from "@/app/(admin)/filas/_components/FilaAtendimentoCard";
import { formatarDataHora } from "@/lib/format";
import { atendimentoService } from "@/services/atendimentoService";

type TomInfo = "info" | "warning" | "danger";

function clienteOuLead(item: {
  cliente: { nome: string; cpfCnpj: string } | null;
  leadNome: string | null;
  leadTelefone: string | null;
}) {
  return item.cliente?.nome ?? item.leadNome ?? "Lead sem nome";
}

function documentoOuTelefone(item: {
  cliente: { cpfCnpj: string } | null;
  leadTelefone: string | null;
}) {
  if (item.cliente?.cpfCnpj) {
    return item.cliente.cpfCnpj;
  }

  if (item.leadTelefone) {
    return item.leadTelefone;
  }

  return "Sem documento ou telefone";
}

function calcularContagemValidade(validoAte?: Date): {
  texto: string;
  tom: TomInfo;
} {
  if (!validoAte) {
    return {
      texto: "Aguardando registro de orçamento",
      tom: "info",
    };
  }

  const agora = new Date();
  const diferencaMs = validoAte.getTime() - agora.getTime();

  if (diferencaMs <= 0) {
    return { texto: "Orçamento vencido", tom: "danger" };
  }

  const diasRestantes = Math.ceil(diferencaMs / (1000 * 60 * 60 * 24));

  if (diasRestantes <= 1) {
    return { texto: "Vence em até 1 dia", tom: "danger" };
  }

  if (diasRestantes <= 3) {
    return { texto: `${diasRestantes} dias restantes`, tom: "warning" };
  }

  return { texto: `${diasRestantes} dias restantes`, tom: "info" };
}

export default async function FilaOrcamentosPage() {
  const itens = await atendimentoService.listarFilaOrcamentos();

  return (
    <div className="space-y-6">
      <PageHeader title="Fila de orçamentos">
        <p className="mt-2 text-sm text-muted-foreground">
          Priorize registros pendentes e acompanhe orcamentos proximos do
          vencimento.
        </p>
      </PageHeader>

      {itens.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Nenhum atendimento na fila de orcamentos.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {itens.map((item) => (
            <FilaAtendimentoCard
              key={item.id}
              atendimentoId={item.id}
              codigo={item.codigo}
              nomeExibicao={clienteOuLead(item)}
              documentoOuTelefone={documentoOuTelefone(item)}
              status={item.status}
              descricaoPrincipal={
                item.orcamento?.validoAte
                  ? `Válido até ${formatarDataHora(item.orcamento.validoAte)}`
                  : "Sem validade definida"
              }
              contagem={calcularContagemValidade(item.orcamento?.validoAte)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
