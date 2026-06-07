"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type {
  ClassificacaoFuncionario,
  EstadoFuncionario,
  PerfilUsuario,
} from "@prisma/client";
import { MoreHorizontalIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import {
  ativarFuncionario,
  excluirOuAnonimizarFuncionario,
  inativarFuncionario,
} from "@/app/(admin)/cadastros/funcionarios/_actions";
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
  useFuncionarios,
  type FuncionarioFiltrosHook,
  type FuncionarioListagemItem,
} from "@/hooks/useFuncionarios";

type AcaoConfirmacao = "inativar" | "ativar" | "excluir";
type Ordenacao = NonNullable<FuncionarioFiltrosHook["ordenarPor"]>;

const opcoesOrdenacao: { value: Ordenacao; label: string }[] = [
  { value: "NOME_ASC", label: "A-Z" },
  { value: "NOME_DESC", label: "Z-A" },
  { value: "CRIADO_EM_DESC", label: "Mais recentes" },
  { value: "CRIADO_EM_ASC", label: "Mais antigos" },
];

function labelEstado(estado: EstadoFuncionario) {
  if (estado === "ATIVO") return "Ativo";
  if (estado === "INATIVO") return "Inativo";
  return "Convidado";
}

function variantEstado(
  estado: EstadoFuncionario,
): "secondary" | "outline" | "destructive" {
  if (estado === "ATIVO") return "secondary";
  if (estado === "INATIVO") return "destructive";
  return "outline";
}

function labelClassificacao(classificacao: ClassificacaoFuncionario) {
  return classificacao === "GERENTE" ? "Gerente" : "Atendente";
}

function labelPerfil(perfil: PerfilUsuario | null | undefined) {
  if (!perfil) return "-";
  return perfil === "ADMIN" ? "ADMIN" : "ATENDENTE";
}

export default function FuncionariosListagem() {
  const [buscaDigitada, setBuscaDigitada] = useState("");
  const [busca, setBusca] = useState("");
  const [estado, setEstado] = useState<EstadoFuncionario | undefined>(
    undefined,
  );
  const [classificacao, setClassificacao] = useState<
    ClassificacaoFuncionario | undefined
  >(undefined);
  const [ordenarPor, setOrdenarPor] = useState<Ordenacao>("NOME_ASC");
  const [pagina, setPagina] = useState(1);

  const [acaoPendente, setAcaoPendente] = useState<AcaoConfirmacao | null>(
    null,
  );
  const [funcionarioSelecionado, setFuncionarioSelecionado] =
    useState<FuncionarioListagemItem | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setBusca(buscaDigitada.trim());
      setPagina(1);
    }, 300);

    return () => clearTimeout(timeout);
  }, [buscaDigitada]);

  const filtros = useMemo<FuncionarioFiltrosHook>(
    () => ({ busca, estado, classificacao, ordenarPor, pagina, tamanho: 10 }),
    [busca, estado, classificacao, ordenarPor, pagina],
  );

  const { data, isLoading, isFetching, refetch } = useFuncionarios(filtros);

  const funcionarios = data?.itens ?? [];
  const totalPaginas = data?.totalPaginas ?? 1;

  function abrirConfirmacao(
    acao: AcaoConfirmacao,
    funcionario: FuncionarioListagemItem,
  ) {
    setAcaoPendente(acao);
    setFuncionarioSelecionado(funcionario);
  }

  function fecharConfirmacao() {
    setAcaoPendente(null);
    setFuncionarioSelecionado(null);
  }

  async function executarAcaoConfirmada() {
    if (!acaoPendente || !funcionarioSelecionado) return;

    if (acaoPendente === "ativar") {
      const resposta = await ativarFuncionario(funcionarioSelecionado.id);
      if (!resposta.success) {
        toast.error(resposta.error.message);
        return;
      }

      toast.success("Funcionario ativado com sucesso.");
      await refetch();
      return;
    }

    if (acaoPendente === "inativar") {
      const resposta = await inativarFuncionario(funcionarioSelecionado.id);
      if (!resposta.success) {
        toast.error(resposta.error.message);
        return;
      }

      toast.success("Funcionario inativado com sucesso.");
      await refetch();
      return;
    }

    const resposta = await excluirOuAnonimizarFuncionario(
      funcionarioSelecionado.id,
    );
    if (!resposta.success) {
      toast.error(resposta.error.message);
      return;
    }

    if (resposta.data.modo === "EXCLUIDO") {
      toast.success("Funcionário excluído com sucesso.");
    } else {
      toast.success("Funcionário anonimizado com sucesso.");
    }

    await refetch();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Funcionários">
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Gerencie funcionários que atuam na operação.
          </p>
          <Button asChild>
            <Link href="/cadastros/funcionarios/novo">
              <PlusIcon className="size-4" />
              Novo funcionário
            </Link>
          </Button>
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium" htmlFor="busca-funcionarios">
              Busca
            </label>
            <Input
              id="busca-funcionarios"
              placeholder="Buscar por nome, e-mail, matrícula ou CPF"
              value={buscaDigitada}
              onChange={(event) => setBuscaDigitada(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              htmlFor="estado-funcionarios"
            >
              Estado
            </label>
            <Select
              value={estado ?? "TODOS"}
              onValueChange={(value) => {
                setEstado(
                  value === "TODOS" ? undefined : (value as EstadoFuncionario),
                );
                setPagina(1);
              }}
            >
              <SelectTrigger id="estado-funcionarios">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos</SelectItem>
                <SelectItem value="CONVIDADO">Convidado</SelectItem>
                <SelectItem value="ATIVO">Ativo</SelectItem>
                <SelectItem value="INATIVO">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              htmlFor="classificacao-funcionarios"
            >
              Cargo
            </label>
            <Select
              value={classificacao ?? "TODOS"}
              onValueChange={(value) => {
                setClassificacao(
                  value === "TODOS"
                    ? undefined
                    : (value as ClassificacaoFuncionario),
                );
                setPagina(1);
              }}
            >
              <SelectTrigger id="classificacao-funcionarios">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos</SelectItem>
                <SelectItem value="GERENTE">Gerente</SelectItem>
                <SelectItem value="ATENDENTE">Atendente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-4">
            <label
              className="text-sm font-medium"
              htmlFor="ordenacao-funcionarios"
            >
              Ordenação
            </label>
            <Select
              value={ordenarPor}
              onValueChange={(value) => {
                setOrdenarPor(value as Ordenacao);
                setPagina(1);
              }}
            >
              <SelectTrigger
                id="ordenacao-funcionarios"
                className="w-full md:w-56"
              >
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
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">
              Carregando funcionários...
            </p>
          ) : funcionarios.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhum funcionário encontrado.
              </p>
              <Button asChild>
                <Link href="/cadastros/funcionarios/novo">
                  Cadastrar primeiro funcionário
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Matrícula</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead className="w-12 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {funcionarios.map((funcionario) => (
                    <TableRow key={funcionario.id}>
                      <TableCell className="font-medium">
                        <div>{funcionario.nomeCompleto}</div>
                        <div className="text-xs text-muted-foreground">
                          {funcionario.emailCorporativo}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatarCpfCnpj(funcionario.cpf)}
                        </div>
                      </TableCell>
                      <TableCell>{funcionario.matricula}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {labelClassificacao(funcionario.classificacao)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {labelPerfil(funcionario.usuario?.perfil)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={variantEstado(funcionario.estado)}>
                          {labelEstado(funcionario.estado)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          {formatarTelefone(funcionario.telefonePrincipal)}
                        </div>
                        {funcionario.telefoneAdicional ? (
                          <div className="text-xs text-muted-foreground">
                            {formatarTelefone(funcionario.telefoneAdicional)}
                          </div>
                        ) : null}
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
                              <Link
                                href={`/cadastros/funcionarios/${funcionario.id}`}
                              >
                                Editar dados
                              </Link>
                            </DropdownMenuItem>
                            {funcionario.estado === "INATIVO" ? (
                              <DropdownMenuItem
                                onSelect={(event) => {
                                  event.preventDefault();
                                  abrirConfirmacao("ativar", funcionario);
                                }}
                              >
                                Ativar
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onSelect={(event) => {
                                  event.preventDefault();
                                  abrirConfirmacao("inativar", funcionario);
                                }}
                              >
                                Inativar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onSelect={(event) => {
                                event.preventDefault();
                                abrirConfirmacao("excluir", funcionario);
                              }}
                            >
                              Excluir/Anonimizar
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
                  {data?.total ?? 0} funcionário(s) encontrado(s)
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
                    Próxima
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        aberto={acaoPendente !== null && funcionarioSelecionado !== null}
        onAbertoChange={(aberto) => {
          if (!aberto) fecharConfirmacao();
        }}
        titulo={
          acaoPendente === "ativar"
            ? "Ativar funcionário"
            : acaoPendente === "inativar"
              ? "Inativar funcionário"
              : "Excluir ou anonimizar funcionário"
        }
        descricao={
          acaoPendente === "ativar"
            ? "Deseja ativar este funcionário e liberar acesso ao sistema?"
            : acaoPendente === "inativar"
              ? "Deseja inativar este funcionário e bloquear novos logins?"
              : "Se for convidado ou sem uso, será excluído. Caso contrário, os dados serão anonimizados."
        }
        textoConfirmar={
          acaoPendente === "ativar"
            ? "Ativar"
            : acaoPendente === "inativar"
              ? "Inativar"
              : "Confirmar"
        }
        textoCancelar="Cancelar"
        onConfirmar={executarAcaoConfirmada}
      />
    </div>
  );
}
