import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import FilaAtendimentoCard from "@/app/(admin)/filas/_components/FilaAtendimentoCard";
import { formatarData } from "@/lib/format";
import { atendimentoService } from "@/services/atendimentoService";

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

export default async function FilaReservasPage() {
  const itens = await atendimentoService.listarFilaReservas();

  return (
    <div className="space-y-6">
      <PageHeader title="Fila de reservas">
        <p className="mt-2 text-sm text-muted-foreground">
          Monitore os atendimentos em reserva e os servicos proximos da
          execucao.
        </p>
      </PageHeader>

      {itens.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Nenhum atendimento na fila de reservas.
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
                item.dataServico
                  ? `Servico em ${formatarData(item.dataServico)}`
                  : "Data do servico nao definida"
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
