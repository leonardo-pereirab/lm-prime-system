"use client";

import { useState } from "react";

import { atualizarParceiro } from "@/app/(admin)/cadastros/parceiros/_actions";
import ParceiroForm from "@/components/forms/ParceiroForm";
import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  formatarCep,
  formatarCpfCnpj,
  formatarTelefone,
} from "@/domain/helpers";
import {
  useParceiro,
  type ParceiroDetalhe as ParceiroDetalheDados,
} from "@/hooks/useParceiros";
import { formatarDataHora } from "@/lib/format";

type ParceiroDetalheProps = {
  id: string;
  iniciarEmEdicao?: boolean;
};

function textoOuTraco(valor: string | null | undefined) {
  return valor && valor.trim() ? valor : "-";
}

function mapearValoresIniciais(parceiro: ParceiroDetalheDados) {
  return {
    nome: parceiro.nome,
    cnpj: parceiro.cnpj,
    telefone: parceiro.telefone,
    email: parceiro.email ?? undefined,
    cep: parceiro.cep ?? undefined,
    logradouro: parceiro.logradouro ?? "",
    numero: parceiro.numero ?? "",
    complemento: parceiro.complemento ?? "",
    bairro: parceiro.bairro ?? "",
    cidade: parceiro.cidade ?? "",
    estado: parceiro.estado ?? undefined,
    ativo: parceiro.ativo,
    observacoes: parceiro.observacoes ?? "",
  };
}

export default function ParceiroDetalhe({
  id,
  iniciarEmEdicao = false,
}: ParceiroDetalheProps) {
  const [modoEdicao, setModoEdicao] = useState(iniciarEmEdicao);

  const {
    data: parceiro,
    isLoading: carregandoParceiro,
    refetch: refetchParceiro,
  } = useParceiro(id);

  if (carregandoParceiro || !parceiro) {
    return (
      <p className="text-sm text-muted-foreground">Carregando parceiro...</p>
    );
  }

  const endereco = [
    parceiro.logradouro,
    parceiro.numero,
    parceiro.complemento,
    parceiro.bairro,
    parceiro.cidade,
    parceiro.estado,
  ]
    .filter((valor) => Boolean(valor && valor.trim()))
    .join(", ");

  return (
    <div className="space-y-6">
      <PageHeader title={parceiro.nome}>
        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant={parceiro.ativo ? "secondary" : "outline"}>
              {parceiro.ativo ? "Ativo" : "Inativo"}
            </Badge>
            <p className="text-sm text-muted-foreground">ID: {parceiro.id}</p>
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
        <ParceiroForm
          modo="editar"
          valoresIniciais={mapearValoresIniciais(parceiro)}
          textoBotaoSalvar="Salvar alterações"
          onCancelar={() => setModoEdicao(false)}
          onSubmit={(payload) => atualizarParceiro(id, payload)}
          onSucesso={async () => {
            setModoEdicao(false);
            await refetchParceiro();
          }}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Dados principais</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Nome</p>
                <p className="text-sm font-medium">{parceiro.nome}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">CNPJ</p>
                <p className="text-sm font-medium">
                  {formatarCpfCnpj(parceiro.cnpj)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Telefone</p>
                <p className="text-sm">{formatarTelefone(parceiro.telefone)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">E-mail</p>
                <p className="text-sm">{textoOuTraco(parceiro.email)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cadastrado em</p>
                <p className="text-sm">
                  {formatarDataHora(parceiro.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Atualizado em</p>
                <p className="text-sm">
                  {formatarDataHora(parceiro.updatedAt)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Endereço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">CEP</p>
                <p className="text-sm">
                  {parceiro.cep ? formatarCep(parceiro.cep) : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Endereço completo
                </p>
                <p className="text-sm">{endereco || "-"}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{textoOuTraco(parceiro.observacoes)}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
