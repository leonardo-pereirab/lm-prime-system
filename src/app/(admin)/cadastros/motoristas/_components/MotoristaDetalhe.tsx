"use client";

import { useState } from "react";
import { AlertTriangleIcon } from "lucide-react";

import { atualizarMotorista } from "@/app/(admin)/cadastros/motoristas/_actions";
import MotoristaForm from "@/components/forms/MotoristaForm";
import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  DIAS_ALERTA_CNH,
  classificarStatusCnh,
  type StatusCnh,
} from "@/domain/motorista";
import { formatarCpfCnpj, formatarTelefone } from "@/domain/helpers";
import {
  useMotorista,
  type MotoristaDetalhe as MotoristaDetalheDados,
} from "@/hooks/useMotoristas";
import { formatarData, formatarDataHora } from "@/lib/format";

type MotoristaDetalheProps = {
  id: string;
  iniciarEmEdicao?: boolean;
};

function textoOuTraco(valor: string | null | undefined) {
  return valor && valor.trim() ? valor : "-";
}

function textoStatusCnh(statusCnh: StatusCnh) {
  if (statusCnh === "VENCIDA") {
    return "CNH vencida";
  }

  if (statusCnh === "VENCENDO") {
    return `CNH vence em ate ${DIAS_ALERTA_CNH} dias`;
  }

  return "CNH valida";
}

function mapearValoresIniciais(motorista: MotoristaDetalheDados) {
  return {
    nome: motorista.nome,
    cpf: motorista.cpf,
    telefone: motorista.telefone,
    cnh: motorista.cnh,
    cnhCategoria: motorista.cnhCategoria as "A" | "B" | "C" | "D" | "E",
    cnhValidade: motorista.cnhValidade,
    ativo: motorista.ativo,
    observacoes: motorista.observacoes ?? "",
  };
}

export default function MotoristaDetalhe({
  id,
  iniciarEmEdicao = false,
}: MotoristaDetalheProps) {
  const [modoEdicao, setModoEdicao] = useState(iniciarEmEdicao);

  const {
    data: motorista,
    isLoading: carregandoMotorista,
    refetch: refetchMotorista,
  } = useMotorista(id);

  if (carregandoMotorista || !motorista) {
    return (
      <p className="text-sm text-muted-foreground">Carregando motorista...</p>
    );
  }

  const statusCnh = classificarStatusCnh(motorista.cnhValidade);

  return (
    <div className="space-y-6">
      <PageHeader title={motorista.nome}>
        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={motorista.ativo ? "secondary" : "outline"}>
              {motorista.ativo ? "Ativo" : "Inativo"}
            </Badge>
            {statusCnh !== "VALIDA" ? (
              <Badge
                variant="outline"
                className="border-warning-600 text-warning-600"
              >
                <AlertTriangleIcon className="size-3" />
                {textoStatusCnh(statusCnh)}
              </Badge>
            ) : null}
            <p className="text-sm text-muted-foreground">ID: {motorista.id}</p>
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
        <MotoristaForm
          modo="editar"
          valoresIniciais={mapearValoresIniciais(motorista)}
          textoBotaoSalvar="Salvar alteracoes"
          onCancelar={() => setModoEdicao(false)}
          onSubmit={(payload) => atualizarMotorista(id, payload)}
          onSucesso={async () => {
            setModoEdicao(false);
            await refetchMotorista();
          }}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Dados do motorista</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Nome</p>
              <p className="text-sm font-medium">{motorista.nome}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">CPF</p>
              <p className="text-sm font-medium">
                {formatarCpfCnpj(motorista.cpf)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Telefone</p>
              <p className="text-sm">{formatarTelefone(motorista.telefone)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">CNH</p>
              <p className="text-sm">
                {motorista.cnh} ({motorista.cnhCategoria})
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Validade da CNH</p>
              <p className="text-sm">{formatarData(motorista.cnhValidade)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cadastrado em</p>
              <p className="text-sm">{formatarDataHora(motorista.createdAt)}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs text-muted-foreground">Observacoes</p>
              <p className="text-sm">{textoOuTraco(motorista.observacoes)}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
