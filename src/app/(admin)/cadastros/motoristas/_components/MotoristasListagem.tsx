"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangleIcon, MoreHorizontalIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import {
  ativarMotorista,
  desativarMotorista,
  excluirMotorista,
} from "@/app/(admin)/cadastros/motoristas/_actions";
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
import {
  DIAS_ALERTA_CNH,
  classificarStatusCnh,
  type StatusCnh,
} from "@/domain/motorista";
import { formatarCpfCnpj, formatarTelefone } from "@/domain/helpers";
import {
  useMotoristas,
  type MotoristaFiltrosHook,
  type MotoristaListagemItem,
} from "@/hooks/useMotoristas";
import { formatarData } from "@/lib/format";

type AcaoConfirmacao = "desativar" | "ativar" | "excluir";

type Ordenacao = NonNullable<MotoristaFiltrosHook["ordenarPor"]>;

const opcoesOrdenacao: { value: Ordenacao; label: string }[] = [
  { value: "NOME_ASC", label: "A-Z" },
  { value: "NOME_DESC", label: "Z-A" },
  { value: "CNH_VALIDADE_ASC", label: "CNH vence primeiro" },
  { value: "CNH_VALIDADE_DESC", label: "CNH vence por ultimo" },
  { value: "CRIADO_EM_DESC", label: "Mais recentes" },
  { value: "CRIADO_EM_ASC", label: "Mais antigos" },
];

function textoStatusCnh(statusCnh: StatusCnh) {
  if (statusCnh === "VENCIDA") {
    return "CNH vencida";
  }

  if (statusCnh === "VENCENDO") {
    return `CNH vence em até ${DIAS_ALERTA_CNH} dias`;
  }

  return "CNH valida";
}

export default function MotoristasListagem() {
  const [buscaDigitada, setBuscaDigitada] = useState("");
  const [busca, setBusca] = useState("");
  const [incluirInativos, setIncluirInativos] = useState(false);
  const [apenasComCnhValida, setApenasComCnhValida] = useState(false);
  const [ordenarPor, setOrdenarPor] = useState<Ordenacao>("NOME_ASC");
  const [pagina, setPagina] = useState(1);

  const [acaoPendente, setAcaoPendente] = useState<AcaoConfirmacao | null>(
    null,
  );
  const [motoristaSelecionado, setMotoristaSelecionado] =
    useState<MotoristaListagemItem | null>(null);
  const [mostrarDialogoEmUso, setMostrarDialogoEmUso] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setBusca(buscaDigitada.trim());
      setPagina(1);
    }, 300);

    return () => clearTimeout(timeout);
  }, [buscaDigitada]);

  const filtros = useMemo<MotoristaFiltrosHook>(
    () => ({
      busca,
      incluirInativos,
      apenasComCnhValida,
      ordenarPor,
      pagina,
      tamanho: 10,
    }),
    [busca, incluirInativos, apenasComCnhValida, ordenarPor, pagina],
  );

  const { data, isLoading, isFetching, refetch } = useMotoristas(filtros);

  const motoristas = data?.itens ?? [];
  const totalPaginas = data?.totalPaginas ?? 1;

  function abrirConfirmacao(
    acao: AcaoConfirmacao,
    motorista: MotoristaListagemItem,
  ) {
    setMotoristaSelecionado(motorista);
    setAcaoPendente(acao);
  }

  function fecharConfirmacao() {
    setAcaoPendente(null);
    setMotoristaSelecionado(null);
  }

  async function executarAcaoConfirmada() {
    if (!acaoPendente || !motoristaSelecionado) {
      return;
    }

    const id = motoristaSelecionado.id;

    if (acaoPendente === "desativar") {
      const resposta = await desativarMotorista(id);
      if (!resposta.success) {
        toast.error(resposta.error.message);
        return;
      }
      toast.success("Motorista desativado com sucesso.");
      await refetch();
      return;
    }

    if (acaoPendente === "ativar") {
      const resposta = await ativarMotorista(id);
      if (!resposta.success) {
        toast.error(resposta.error.message);
        return;
      }
      toast.success("Motorista ativado com sucesso.");
      await refetch();
      return;
    }

    const resposta = await excluirMotorista(id);
    if (!resposta.success) {
      if (resposta.error.code === "EM_USO") {
        setMostrarDialogoEmUso(true);
        return;
      }

      toast.error(resposta.error.message);
      return;
    }

    toast.success("Motorista excluído com sucesso.");
    await refetch();
  }

  async function desativarAposBloqueioExclusao() {
    if (!motoristaSelecionado) {
      return;
    }

    const resposta = await desativarMotorista(motoristaSelecionado.id);
    if (!resposta.success) {
      toast.error(resposta.error.message);
      return;
    }

    toast.success("Motorista desativado com sucesso.");
    setMostrarDialogoEmUso(false);
    fecharConfirmacao();
    await refetch();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Motoristas">
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Gerencie os motoristas e acompanhe o vencimento das CNHs.
          </p>
          <Button asChild>
            <Link href="/cadastros/motoristas/novo">
              <PlusIcon className="size-4" />
              Novo motorista
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
            <label className="text-sm font-medium" htmlFor="busca-motoristas">
              Busca
            </label>
            <Input
              id="busca-motoristas"
              placeholder="Buscar por nome ou CPF"
              value={buscaDigitada}
              onChange={(event) => setBuscaDigitada(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              htmlFor="ordenacao-motoristas"
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
              <SelectTrigger id="ordenacao-motoristas" className="w-full">
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
              id="mostrar-inativos-motoristas"
              checked={incluirInativos}
              onCheckedChange={(checked) => {
                setIncluirInativos(checked);
                setPagina(1);
              }}
            />
            <label className="text-sm" htmlFor="mostrar-inativos-motoristas">
              Mostrar inativos
            </label>
          </div>

          <div className="flex items-center gap-3 md:col-span-3">
            <Switch
              id="mostrar-cnh-valida"
              checked={apenasComCnhValida}
              onCheckedChange={(checked) => {
                setApenasComCnhValida(checked);
                setPagina(1);
              }}
            />
            <label className="text-sm" htmlFor="mostrar-cnh-valida">
              Apenas com CNH válida
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">
              Carregando motoristas...
            </p>
          ) : motoristas.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhum motorista encontrado.
              </p>
              <Button asChild>
                <Link href="/cadastros/motoristas/novo">
                  Cadastrar primeiro motorista
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>CNH</TableHead>
                    <TableHead>Validade CNH</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {motoristas.map((motorista) => {
                    const statusCnh = classificarStatusCnh(
                      motorista.cnhValidade,
                    );

                    return (
                      <TableRow key={motorista.id}>
                        <TableCell className="font-medium">
                          {motorista.nome}
                        </TableCell>
                        <TableCell>{formatarCpfCnpj(motorista.cpf)}</TableCell>
                        <TableCell>
                          {formatarTelefone(motorista.telefone)}
                        </TableCell>
                        <TableCell>
                          {motorista.cnh} ({motorista.cnhCategoria})
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{formatarData(motorista.cnhValidade)}</span>
                            {statusCnh !== "VALIDA" ? (
                              <Badge
                                variant="outline"
                                className="border-warning-600 text-warning-600"
                              >
                                <AlertTriangleIcon className="size-3" />
                                {textoStatusCnh(statusCnh)}
                              </Badge>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={motorista.ativo ? "secondary" : "outline"}
                          >
                            {motorista.ativo ? "Ativo" : "Inativo"}
                          </Badge>
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
                                  href={`/cadastros/motoristas/${motorista.id}`}
                                >
                                  Ver
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/cadastros/motoristas/${motorista.id}?editar=1`}
                                >
                                  Editar
                                </Link>
                              </DropdownMenuItem>
                              {motorista.ativo ? (
                                <DropdownMenuItem
                                  onSelect={(event) => {
                                    event.preventDefault();
                                    abrirConfirmacao("desativar", motorista);
                                  }}
                                >
                                  Desativar
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onSelect={(event) => {
                                    event.preventDefault();
                                    abrirConfirmacao("ativar", motorista);
                                  }}
                                >
                                  Ativar
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-destructive"
                                onSelect={(event) => {
                                  event.preventDefault();
                                  abrirConfirmacao("excluir", motorista);
                                }}
                              >
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between gap-2 border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  {data?.total ?? 0} motorista(s) encontrado(s)
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
        aberto={Boolean(acaoPendente && motoristaSelecionado)}
        onAbertoChange={(aberto) => {
          if (!aberto) {
            fecharConfirmacao();
          }
        }}
        titulo={
          acaoPendente === "desativar"
            ? "Desativar motorista"
            : acaoPendente === "ativar"
              ? "Ativar motorista"
              : "Excluir motorista"
        }
        descricao={
          acaoPendente === "desativar"
            ? "O motorista deixará de aparecer nos seletores padrão das próximas escalas."
            : acaoPendente === "ativar"
              ? "O motorista voltará a aparecer nos seletores padrão das escalas."
              : "Esta ação remove o motorista definitivamente quando não houver atendimentos vinculados."
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
        titulo="Motorista em uso"
        descricao="Este motorista possui atendimentos vinculados e não pode ser excluído. Deseja desativar o cadastro em vez de excluir?"
        textoConfirmar="Desativar motorista"
        textoCancelar="Fechar"
        onConfirmar={desativarAposBloqueioExclusao}
      />
    </div>
  );
}
