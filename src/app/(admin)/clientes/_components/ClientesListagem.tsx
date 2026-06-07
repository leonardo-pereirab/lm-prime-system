"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useEffect } from "react";
import { MoreHorizontalIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import {
  ativarCliente,
  desativarCliente,
  excluirCliente,
} from "@/app/(admin)/clientes/_actions";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { formatarCpfCnpj, formatarTelefone } from "@/domain/helpers";
import {
  useClientes,
  type ClienteFiltrosHook,
  type ClienteListagemItem,
} from "@/hooks/useClientes";

type AcaoConfirmacao = "desativar" | "ativar" | "excluir";

type Ordenacao = NonNullable<ClienteFiltrosHook["ordenarPor"]>;

const opcoesOrdenacao: { value: Ordenacao; label: string }[] = [
  { value: "NOME_ASC", label: "A-Z" },
  { value: "NOME_DESC", label: "Z-A" },
  { value: "CRIADO_EM_DESC", label: "Mais recentes" },
  { value: "CRIADO_EM_ASC", label: "Mais antigos" },
];

function cidadeUf(cliente: ClienteListagemItem) {
  if (!cliente.cidade && !cliente.estado) {
    return "-";
  }

  if (cliente.cidade && cliente.estado) {
    return `${cliente.cidade}/${cliente.estado}`;
  }

  return cliente.cidade ?? cliente.estado ?? "-";
}

export default function ClientesListagem() {
  const [buscaDigitada, setBuscaDigitada] = useState("");
  const [busca, setBusca] = useState("");
  const [incluirInativos, setIncluirInativos] = useState(false);
  const [ordenarPor, setOrdenarPor] = useState<Ordenacao>("NOME_ASC");
  const [pagina, setPagina] = useState(1);

  const [acaoPendente, setAcaoPendente] = useState<AcaoConfirmacao | null>(
    null,
  );
  const [clienteSelecionado, setClienteSelecionado] =
    useState<ClienteListagemItem | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setBusca(buscaDigitada.trim());
      setPagina(1);
    }, 300);

    return () => clearTimeout(timeout);
  }, [buscaDigitada]);

  const filtros = useMemo<ClienteFiltrosHook>(
    () => ({ busca, incluirInativos, ordenarPor, pagina, tamanho: 10 }),
    [busca, incluirInativos, ordenarPor, pagina],
  );

  const { data, isLoading, isFetching, refetch } = useClientes(filtros);

  const clientes = data?.itens ?? [];
  const totalPaginas = data?.totalPaginas ?? 1;

  function abrirConfirmacao(
    acao: AcaoConfirmacao,
    cliente: ClienteListagemItem,
  ) {
    setClienteSelecionado(cliente);
    setAcaoPendente(acao);
  }

  function fecharConfirmacao() {
    setAcaoPendente(null);
    setClienteSelecionado(null);
  }

  async function executarAcaoConfirmada() {
    if (!acaoPendente || !clienteSelecionado) {
      return;
    }

    const id = clienteSelecionado.id;

    if (acaoPendente === "desativar") {
      const resposta = await desativarCliente(id);
      if (!resposta.success) {
        toast.error(resposta.error.message);
        return;
      }
      toast.success("Cliente desativado com sucesso.");
      await refetch();
      return;
    }

    if (acaoPendente === "ativar") {
      const resposta = await ativarCliente(id);
      if (!resposta.success) {
        toast.error(resposta.error.message);
        return;
      }
      toast.success("Cliente ativado com sucesso.");
      await refetch();
      return;
    }

    const resposta = await excluirCliente(id);
    if (!resposta.success) {
      toast.error(resposta.error.message);
      return;
    }

    toast.success(
      resposta.data.modo === "EXCLUIDO"
        ? "Cliente excluído com sucesso."
        : "Cliente anonimizado com sucesso.",
    );
    fecharConfirmacao();
    await refetch();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Clientes">
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Gerencie os clientes cadastrados da operação.
          </p>
          <Button asChild>
            <Link href="/clientes/novo">
              <PlusIcon className="size-4" />
              Novo cliente
            </Link>
          </Button>
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium" htmlFor="busca-clientes">
              Busca
            </label>
            <Input
              id="busca-clientes"
              placeholder="Buscar por nome ou CPF/CNPJ"
              value={buscaDigitada}
              onChange={(event) => setBuscaDigitada(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="ordenacao-clientes">
              Ordenacao
            </label>
            <Select
              value={ordenarPor}
              onValueChange={(value) => {
                setOrdenarPor(value as Ordenacao);
                setPagina(1);
              }}
            >
              <SelectTrigger id="ordenacao-clientes" className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {opcoesOrdenacao.map((opcao) => (
                  <SelectItem key={opcao.value} value={opcao.value}>
                    {opcao.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 md:col-span-3">
            <Switch
              id="mostrar-inativos"
              checked={incluirInativos}
              onCheckedChange={(checked) => {
                setIncluirInativos(checked);
                setPagina(1);
              }}
            />
            <label className="text-sm" htmlFor="mostrar-inativos">
              Mostrar inativos
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">
              Carregando clientes...
            </p>
          ) : clientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhum cliente encontrado.
              </p>
              <Button asChild>
                <Link href="/clientes/novo">Cadastrar primeiro cliente</Link>
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF/CNPJ</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Cidade/UF</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientes.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">
                        {cliente.nome}
                      </TableCell>
                      <TableCell>{formatarCpfCnpj(cliente.cpfCnpj)}</TableCell>
                      <TableCell>
                        {formatarTelefone(cliente.telefone)}
                      </TableCell>
                      <TableCell>{cidadeUf(cliente)}</TableCell>
                      <TableCell>
                        {cliente.anonimizadoEm ? (
                          <Badge variant="destructive">Anonimizado</Badge>
                        ) : (
                          <Badge
                            variant={cliente.ativo ? "secondary" : "outline"}
                          >
                            {cliente.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Ações"
                            >
                              <MoreHorizontalIcon className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/clientes/${cliente.id}`}>Ver</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/clientes/${cliente.id}?editar=1`}>
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            {cliente.ativo ? (
                              <DropdownMenuItem
                                onSelect={(event) => {
                                  event.preventDefault();
                                  abrirConfirmacao("desativar", cliente);
                                }}
                              >
                                Desativar
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onSelect={(event) => {
                                  event.preventDefault();
                                  abrirConfirmacao("ativar", cliente);
                                }}
                              >
                                Ativar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onSelect={(event) => {
                                event.preventDefault();
                                abrirConfirmacao("excluir", cliente);
                              }}
                            >
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between gap-2 border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  {data?.total ?? 0} cliente(s) encontrado(s)
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pagina <= 1 || isFetching}
                    onClick={() => setPagina((atual) => Math.max(1, atual - 1))}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {pagina} de {totalPaginas}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pagina >= totalPaginas || isFetching}
                    onClick={() =>
                      setPagina((atual) => Math.min(totalPaginas, atual + 1))
                    }
                  >
                    Proxima
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        aberto={Boolean(acaoPendente && clienteSelecionado)}
        onAbertoChange={(aberto) => {
          if (!aberto) {
            fecharConfirmacao();
          }
        }}
        titulo={
          acaoPendente === "desativar"
            ? "Desativar cliente"
            : acaoPendente === "ativar"
              ? "Ativar cliente"
              : "Excluir cliente"
        }
        descricao={
          acaoPendente === "desativar"
            ? "O cliente deixará de aparecer nas listagens padrão e seletores de novas etapas."
            : acaoPendente === "ativar"
              ? "O cliente voltará a aparecer nas listagens e seletores padrão."
              : "Sem atendimentos vinculados, o cliente será excluído. Caso contrário, os dados serão anonimizados para preservar o histórico."
        }
        textoConfirmar={
          acaoPendente === "desativar"
            ? "Desativar"
            : acaoPendente === "ativar"
              ? "Ativar"
              : "Excluir"
        }
        varianteConfirmar={
          acaoPendente === "excluir" ? "destructive" : "default"
        }
        onConfirmar={executarAcaoConfirmada}
      />
    </div>
  );
}
