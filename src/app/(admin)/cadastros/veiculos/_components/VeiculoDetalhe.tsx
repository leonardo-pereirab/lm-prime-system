"use client";

import { TipoVeiculo } from "@prisma/client";
import { useState } from "react";

import { atualizarVeiculo } from "@/app/(admin)/cadastros/veiculos/_actions";
import VeiculoForm from "@/components/forms/VeiculoForm";
import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  useVeiculo,
  type VeiculoDetalhe as VeiculoDetalheDados,
} from "@/hooks/useVeiculos";
import { formatarDataHora } from "@/lib/format";

type VeiculoDetalheProps = {
  id: string;
  iniciarEmEdicao?: boolean;
};

const tiposRotulados: { value: TipoVeiculo; label: string }[] = [
  { value: TipoVeiculo.CARRO_PASSEIO, label: "Carro de passeio" },
  { value: TipoVeiculo.VAN, label: "Van" },
  { value: TipoVeiculo.MICRO_ONIBUS, label: "Micro-ônibus" },
  { value: TipoVeiculo.ONIBUS, label: "Ônibus" },
  { value: TipoVeiculo.OUTRO, label: "Outro" },
];

function textoOuTraco(valor: string | null | undefined) {
  return valor && valor.trim() ? valor : "-";
}

function labelTipo(tipo: string) {
  return tiposRotulados.find((opcao) => opcao.value === tipo)?.label ?? tipo;
}

function textoCapacidade(capacidade: number) {
  return `${capacidade} passageiro${capacidade === 1 ? "" : "s"}`;
}

function mapearValoresIniciais(veiculo: VeiculoDetalheDados) {
  return {
    placa: veiculo.placa,
    modelo: veiculo.modelo,
    marca: veiculo.marca,
    ano: veiculo.ano,
    capacidade: veiculo.capacidade,
    tipo: veiculo.tipo as TipoVeiculo,
    ativo: veiculo.ativo,
    observacoes: veiculo.observacoes ?? "",
  };
}

export default function VeiculoDetalhe({
  id,
  iniciarEmEdicao = false,
}: VeiculoDetalheProps) {
  const [modoEdicao, setModoEdicao] = useState(iniciarEmEdicao);

  const {
    data: veiculo,
    isLoading: carregandoVeiculo,
    refetch: refetchVeiculo,
  } = useVeiculo(id);

  if (carregandoVeiculo || !veiculo) {
    return (
      <p className="text-sm text-muted-foreground">Carregando veículo...</p>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={`${veiculo.modelo} • ${veiculo.placa}`}>
        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={veiculo.ativo ? "secondary" : "outline"}>
              {veiculo.ativo ? "Ativo" : "Inativo"}
            </Badge>
            <Badge variant="outline">{labelTipo(veiculo.tipo)}</Badge>
            <Badge variant="outline">
              {textoCapacidade(veiculo.capacidade)}
            </Badge>
            <p className="text-sm text-muted-foreground">ID: {veiculo.id}</p>
          </div>
          {modoEdicao ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setModoEdicao(false)}
            >
              Cancelar
            </Button>
          ) : (
            <Button type="button" onClick={() => setModoEdicao(true)}>
              Editar
            </Button>
          )}
        </div>
      </PageHeader>

      {modoEdicao ? (
        <VeiculoForm
          modo="editar"
          valoresIniciais={mapearValoresIniciais(veiculo)}
          textoBotaoSalvar="Salvar alterações"
          onCancelar={() => setModoEdicao(false)}
          onSubmit={(payload) => atualizarVeiculo(id, payload)}
          onSucesso={async () => {
            setModoEdicao(false);
            await refetchVeiculo();
          }}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Dados do veículo</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Modelo</p>
              <p className="text-sm font-medium">{veiculo.modelo}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Marca</p>
              <p className="text-sm">{veiculo.marca}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Placa</p>
              <p className="text-sm">{veiculo.placa}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ano</p>
              <p className="text-sm">{veiculo.ano}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tipo</p>
              <p className="text-sm">{labelTipo(veiculo.tipo)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Capacidade</p>
              <p className="text-sm">{textoCapacidade(veiculo.capacidade)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cadastrado em</p>
              <p className="text-sm">{formatarDataHora(veiculo.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Atualizado em</p>
              <p className="text-sm">{formatarDataHora(veiculo.updatedAt)}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs text-muted-foreground">Observações</p>
              <p className="text-sm">{textoOuTraco(veiculo.observacoes)}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
