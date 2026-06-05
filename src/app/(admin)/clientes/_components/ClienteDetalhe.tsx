"use client";

import Link from "next/link";
import { useState } from "react";

import { atualizarCliente } from "@/app/(admin)/clientes/_actions";
import ClienteForm from "@/components/forms/ClienteForm";
import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  formatarCep,
  formatarCpfCnpj,
  formatarTelefone,
} from "@/domain/helpers";
import { STATUS_LABELS } from "@/domain/status";
import {
  useAtendimentosDoCliente,
  useCliente,
  type ClienteDetalhe as ClienteDetalheDados,
} from "@/hooks/useClientes";
import { formatarDataHora } from "@/lib/format";

type ClienteDetalheProps = {
  id: string;
  iniciarEmEdicao?: boolean;
};

function textoOuTraco(valor: string | null | undefined) {
  return valor && valor.trim() ? valor : "-";
}

function mapearValoresIniciais(cliente: ClienteDetalheDados) {
  return {
    nome: cliente.nome,
    cpfCnpj: cliente.cpfCnpj,
    rgIe: cliente.rgIe ?? "",
    telefone: cliente.telefone,
    telefoneSec: cliente.telefoneSec ?? undefined,
    email: cliente.email ?? undefined,
    cep: cliente.cep ?? undefined,
    logradouro: cliente.logradouro ?? "",
    numero: cliente.numero ?? "",
    complemento: cliente.complemento ?? "",
    bairro: cliente.bairro ?? "",
    cidade: cliente.cidade ?? "",
    estado: cliente.estado ?? undefined,
    ativo: cliente.ativo,
    observacoes: cliente.observacoes ?? "",
  };
}

export default function ClienteDetalhe({
  id,
  iniciarEmEdicao = false,
}: ClienteDetalheProps) {
  const [modoEdicao, setModoEdicao] = useState(iniciarEmEdicao);

  const {
    data: cliente,
    isLoading: carregandoCliente,
    refetch: refetchCliente,
  } = useCliente(id);

  const {
    data: atendimentos,
    isLoading: carregandoAtendimentos,
    refetch: refetchAtendimentos,
  } = useAtendimentosDoCliente(id);

  if (carregandoCliente || !cliente) {
    return (
      <p className="text-sm text-muted-foreground">Carregando cliente...</p>
    );
  }

  const endereco = [
    cliente.logradouro,
    cliente.numero,
    cliente.complemento,
    cliente.bairro,
    cliente.cidade,
    cliente.estado,
  ]
    .filter((valor) => Boolean(valor && valor.trim()))
    .join(", ");

  return (
    <div className="space-y-6">
      <PageHeader title={cliente.nome}>
        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {cliente.anonimizadoEm ? (
              <Badge variant="destructive">Anonimizado</Badge>
            ) : (
              <Badge variant={cliente.ativo ? "secondary" : "outline"}>
                {cliente.ativo ? "Ativo" : "Inativo"}
              </Badge>
            )}
            <p className="text-sm text-muted-foreground">ID: {cliente.id}</p>
          </div>
          {cliente.anonimizadoEm ? null : modoEdicao ? (
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

      {cliente.anonimizadoEm ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Este cadastro foi anonimizado para preservar o historico de
              atendimentos vinculados.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {modoEdicao && !cliente.anonimizadoEm ? (
        <ClienteForm
          modo="editar"
          valoresIniciais={mapearValoresIniciais(cliente)}
          textoBotaoSalvar="Salvar alteracoes"
          onCancelar={() => setModoEdicao(false)}
          onSubmit={(payload) => atualizarCliente(id, payload)}
          onSucesso={async () => {
            setModoEdicao(false);
            await Promise.all([refetchCliente(), refetchAtendimentos()]);
          }}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Dados pessoais</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Nome</p>
                  <p className="text-sm font-medium">{cliente.nome}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">CPF/CNPJ</p>
                  <p className="text-sm font-medium">
                    {formatarCpfCnpj(cliente.cpfCnpj)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">RG/IE</p>
                  <p className="text-sm">{textoOuTraco(cliente.rgIe)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cadastrado em</p>
                  <p className="text-sm">
                    {formatarDataHora(cliente.createdAt)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contato</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Telefone principal
                  </p>
                  <p className="text-sm font-medium">
                    {formatarTelefone(cliente.telefone)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Telefone secundario
                  </p>
                  <p className="text-sm">
                    {cliente.telefoneSec
                      ? formatarTelefone(cliente.telefoneSec)
                      : "-"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-muted-foreground">E-mail</p>
                  <p className="text-sm">{textoOuTraco(cliente.email)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Endereco</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">CEP</p>
                  <p className="text-sm">
                    {cliente.cep ? formatarCep(cliente.cep) : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Endereco completo
                  </p>
                  <p className="text-sm">{endereco || "-"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Observacoes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{textoOuTraco(cliente.observacoes)}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Atendimentos deste cliente</CardTitle>
            </CardHeader>
            <CardContent>
              {carregandoAtendimentos ? (
                <p className="text-sm text-muted-foreground">Carregando...</p>
              ) : !atendimentos || atendimentos.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum atendimento vinculado.
                </p>
              ) : (
                <ul className="space-y-3">
                  {atendimentos.map((atendimento) => (
                    <li key={atendimento.id} className="rounded-md border p-3">
                      <p className="text-sm font-medium">
                        {atendimento.codigo ?? atendimento.id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {STATUS_LABELS[atendimento.status] ??
                          atendimento.status}
                      </p>
                      <Button
                        asChild
                        variant="link"
                        className="h-auto px-0 py-1 text-xs"
                      >
                        <Link href={`/atendimentos/${atendimento.id}`}>
                          Abrir atendimento
                        </Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
