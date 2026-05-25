import PageHeader from "@/components/layout/PageHeader";
import ReservaForm from "@/components/forms/ReservaForm";

import { buscarAtendimentoComGuardEtapa } from "../_utils/etapasAtendimento";

type PageProps = { params: Promise<{ id: string }> };

export default async function AtendimentoReservaPage({ params }: PageProps) {
  const { id } = await params;
  const atendimento = await buscarAtendimentoComGuardEtapa({
    atendimentoId: id,
    etapa: "reserva",
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Reserva">
        <p className="mt-2 text-sm text-muted-foreground">
          Atendimento: {atendimento.codigo ?? atendimento.id}
        </p>
      </PageHeader>

      <ReservaForm
        atendimentoId={atendimento.id}
        statusAtual={atendimento.status}
        cliente={
          atendimento.cliente
            ? {
                id: atendimento.cliente.id,
                nome: atendimento.cliente.nome,
                cpfCnpj: atendimento.cliente.cpfCnpj,
                telefone: atendimento.cliente.telefone,
                telefoneSec: atendimento.cliente.telefoneSec,
                email: atendimento.cliente.email,
                logradouro: atendimento.cliente.logradouro,
                numero: atendimento.cliente.numero,
                complemento: atendimento.cliente.complemento,
                bairro: atendimento.cliente.bairro,
                cidade: atendimento.cliente.cidade,
                estado: atendimento.cliente.estado,
              }
            : null
        }
        leadNome={atendimento.leadNome}
        leadTelefone={atendimento.leadTelefone}
        reserva={
          atendimento.reserva
            ? {
                id: atendimento.reserva.id,
                confirmadaEm: atendimento.reserva.confirmadaEm,
                observacoes: atendimento.reserva.observacoes,
              }
            : null
        }
      />
    </div>
  );
}
