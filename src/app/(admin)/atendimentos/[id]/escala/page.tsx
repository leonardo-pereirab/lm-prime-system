import PageHeader from "@/components/layout/PageHeader";
import EscalaForm from "@/components/forms/EscalaForm";
import { motoristaService } from "@/services/motoristaService";
import { parceiroService } from "@/services/parceiroService";
import { veiculoService } from "@/services/veiculoService";

import { buscarAtendimentoComGuardEtapa } from "../_utils/etapasAtendimento";

type PageProps = { params: Promise<{ id: string }> };

export default async function AtendimentoEscalaPage({ params }: PageProps) {
  const { id } = await params;
  const [atendimento, motoristas, veiculos, parceiros] = await Promise.all([
    buscarAtendimentoComGuardEtapa({
      atendimentoId: id,
      etapa: "escala",
    }),
    motoristaService.listar({ pagina: 1, tamanho: 300 }),
    veiculoService.listar({ pagina: 1, tamanho: 300 }),
    parceiroService.listar({ pagina: 1, tamanho: 300 }),
  ]);

  const escalaInicial = atendimento.escala
    ? {
        id: atendimento.escala.id,
        observacoes: atendimento.escala.observacoes,
        motoristaIds: atendimento.escala.motoristas.map(
          (item) => item.motoristaId,
        ),
        veiculoIds: atendimento.escala.veiculos.map((item) => item.veiculoId),
        parceiros: atendimento.escala.parceiros.map((item) => ({
          parceiroId: item.parceiroId,
          qtdVeiculos: item.qtdVeiculos,
          tipoVeiculo: item.tipoVeiculo,
          valorRepasse: Number(item.valorRepasse),
          observacoes: item.observacoes,
        })),
      }
    : null;

  return (
    <div className="space-y-6">
      <PageHeader title="Escala">
        <p className="mt-2 text-sm text-muted-foreground">
          Atendimento: {atendimento.codigo ?? atendimento.id}
        </p>
      </PageHeader>

      <EscalaForm
        atendimentoId={atendimento.id}
        statusAtual={atendimento.status}
        qtdPassageiros={atendimento.qtdPassageiros}
        escala={escalaInicial}
        motoristas={motoristas.map((motorista) => ({
          id: motorista.id,
          nome: motorista.nome,
          cnhValidade: motorista.cnhValidade,
        }))}
        veiculos={veiculos.map((veiculo) => ({
          id: veiculo.id,
          modelo: veiculo.modelo,
          placa: veiculo.placa,
          tipo: veiculo.tipo,
          capacidade: veiculo.capacidade,
        }))}
        parceiros={parceiros.map((parceiro) => ({
          id: parceiro.id,
          nome: parceiro.nome,
        }))}
      />
    </div>
  );
}
