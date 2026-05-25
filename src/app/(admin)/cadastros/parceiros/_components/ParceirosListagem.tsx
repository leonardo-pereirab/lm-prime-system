"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MoreHorizontalIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import {
  ativarParceiro,
  desativarParceiro,
  excluirParceiro,
} from "@/app/(admin)/cadastros/parceiros/_actions";
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
  useParceiros,
  type ParceiroFiltrosHook,
  type ParceiroListagemItem,
} from "@/hooks/useParceiros";

type AcaoConfirmacao = "desativar" | "ativar" | "excluir";
type Ordenacao = NonNullable<ParceiroFiltrosHook["ordenarPor"]>;

const opcoesOrdenacao: { value: Ordenacao; label: string }[] = [
  { value: "NOME_ASC", label: "A-Z" },
  { value: "NOME_DESC", label: "Z-A" },
  { value: "CRIADO_EM_DESC", label: "Mais recentes" },
  { value: "CRIADO_EM_ASC", label: "Mais antigos" },
];

function cidadeUf(parceiro: ParceiroListagemItem) {
  if (!parceiro.cidade && !parceiro.estado) {
    return "-";
  }

  if (parceiro.cidade && parceiro.estado) {
    return `${parceiro.cidade}/${parceiro.estado}`;
  }

  return parceiro.cidade ?? parceiro.estado ?? "-";
}

export default function ParceirosListagem() {
  const [buscaDigitada, setBuscaDigitada] = useState("");
  const [busca, setBusca] = useState("");
  const [incluirInativos, setIncluirInativos] = useState(false);
  const [ordenarPor, setOrdenarPor] = useState<Ordenacao>("NOME_ASC");
  const [pagina, setPagina] = useState(1);

  const [acaoPendente, setAcaoPendente] = useState<AcaoConfirmacao | null>(
    null,
  );
  const [parceiroSelecionado, setParceiroSelecionado] =
    useState<ParceiroListagemItem | null>(null);
  const [mostrarDialogoEmUso, setMostrarDialogoEmUso] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setBusca(buscaDigitada.trim());
      setPagina(1);
    }, 300);

    return () => clearTimeout(timeout);
  }, [buscaDigitada]);

  const filtros = useMemo<ParceiroFiltrosHook>(
    () => ({ busca, incluirInativos, ordenarPor, pagina, tamanho: 10 }),
    [busca, incluirInativos, ordenarPor, pagina],
  );

  const { data, isLoading, isFetching, refetch } = useParceiros(filtros);

  const parceiros = data?.itens ?? [];
  const totalPaginas = data?.totalPaginas ?? 1;

  function abrirConfirmacao(
    acao: AcaoConfirmacao,
    parceiro: ParceiroListagemItem,
  ) {
    setParceiroSelecionado(parceiro);
    setAcaoPendente(acao);
  }

  function fecharConfirmacao() {
    setAcaoPendente(null);
    setParceiroSelecionado(null);
  }

  async function executarAcaoConfirmada() {
    if (!acaoPendente || !parceiroSelecionado) {
      return;
    }

    const id = parceiroSelecionado.id;

    if (acaoPendente === "desativar") {
      const resposta = await desativarParceiro(id);
      if (!resposta.success) {
        toast.error(resposta.error.message);
        return;
      }

      toast.success("Parceiro desativado com sucesso.");
      await refetch();
      return;
    }

    if (acaoPendente === "ativar") {
      const resposta = await ativarParceiro(id);
      if (!resposta.success) {
        toast.error(resposta.error.message);
        return;
      }

      toast.success("Parceiro ativado com sucesso.");
      await refetch();
      return;
    }

    const resposta = await excluirParceiro(id);
    if (!resposta.success) {
      if (resposta.error.code === "EM_USO") {
        setMostrarDialogoEmUso(true);
        return;
      }

      toast.error(resposta.error.message);
      return;
    }

    toast.success("Parceiro excluido com sucesso.");
    await refetch();
  }

  async function desativarAposBloqueioExclusao() {
    if (!parceiroSelecionado) {
      return;
    }

    const resposta = await desativarParceiro(parceiroSelecionado.id);
    if (!resposta.success) {
      toast.error(resposta.error.message);
      return;
    }

    toast.success("Parceiro desativado com sucesso.");
    setMostrarDialogoEmUso(false);
    fecharConfirmacao();
    await refetch();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Parceiros">
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Gerencie as empresas terceirizadas cadastradas para apoio na
            operacao.
          </p>
          <Button asChild>
            <Link href="/cadastros/parceiros/novo">
              <PlusIcon className="size-4" />
              Novo parceiro
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
            <label className="text-sm font-medium" htmlFor="busca-parceiros">
              Busca
            </label>
            <Input
              id="busca-parceiros"
              placeholder="Buscar por nome ou CNPJ"
              value={buscaDigitada}
              onChange={(event) => setBuscaDigitada(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              htmlFor="ordenacao-parceiros"
            >
              Ordenacao
            </label>
            <Select
              value={ordenarPor}
              onValueChange={(value) => {
                setOrdenarPor(value as Ordenacao);
                setPagina(1);
              }}
            >
              <SelectTrigger id="ordenacao-parceiros" className="w-full">
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
              id="mostrar-inativos-parceiros"
              checked={incluirInativos}
              onCheckedChange={(checked) => {
                setIncluirInativos(checked);
                setPagina(1);
              }}
            />
            <label className="text-sm" htmlFor="mostrar-inativos-parceiros">
              Mostrar inativos
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">
              Carregando parceiros...
            </p>
          ) : parceiros.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhum parceiro encontrado.
              </p>
              <Button asChild>
                <Link href="/cadastros/parceiros/novo">
                  Cadastrar primeiro parceiro
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Cidade/UF</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12 text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parceiros.map((parceiro) => (
                    <TableRow key={parceiro.id}>
                      <TableCell className="font-medium">
                        {parceiro.nome}
                      </TableCell>
                      <TableCell>{formatarCpfCnpj(parceiro.cnpj)}</TableCell>
                      <TableCell>
                        {formatarTelefone(parceiro.telefone)}
                      </TableCell>
                      <TableCell>{cidadeUf(parceiro)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={parceiro.ativo ? "secondary" : "outline"}
                        >
                          {parceiro.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Acoes"
                            >
                              <MoreHorizontalIcon className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/cadastros/parceiros/${parceiro.id}`}
                              >
                                Ver
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/cadastros/parceiros/${parceiro.id}?editar=1`}
                              >
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            {parceiro.ativo ? (
                              <DropdownMenuItem
                                onSelect={(event) => {
                                  event.preventDefault();
                                  abrirConfirmacao("desativar", parceiro);
                                }}
                              >
                                Desativar
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onSelect={(event) => {
                                  event.preventDefault();
                                  abrirConfirmacao("ativar", parceiro);
                                }}
                              >
                                Ativar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onSelect={(event) => {
                                event.preventDefault();
                                abrirConfirmacao("excluir", parceiro);
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
                  {data?.total ?? 0} parceiro(s) encontrado(s)
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
                    Pagina {pagina} de {totalPaginas}
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
        aberto={Boolean(acaoPendente && parceiroSelecionado)}
        onAbertoChange={(aberto) => {
          if (!aberto) {
            fecharConfirmacao();
          }
        }}
        titulo={
          acaoPendente === "desativar"
            ? "Desativar parceiro"
            : acaoPendente === "ativar"
              ? "Ativar parceiro"
              : "Excluir parceiro"
        }
        descricao={
          acaoPendente === "desativar"
            ? "O parceiro deixara de aparecer nos seletores padrao das proximas escalas."
            : acaoPendente === "ativar"
              ? "O parceiro voltara a aparecer nos seletores padrao das escalas."
              : "Esta acao remove o parceiro definitivamente quando nao houver atendimentos vinculados."
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

      <ConfirmDialog
        aberto={mostrarDialogoEmUso}
        onAbertoChange={(aberto) => {
          setMostrarDialogoEmUso(aberto);
          if (!aberto) {
            fecharConfirmacao();
          }
        }}
        titulo="Parceiro em uso"
        descricao="Este parceiro possui atendimentos vinculados e nao pode ser excluido. Deseja desativar o cadastro em vez de excluir?"
        textoConfirmar="Desativar parceiro"
        textoCancelar="Fechar"
        onConfirmar={desativarAposBloqueioExclusao}
      />
    </div>
  );
}
