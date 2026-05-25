"use client";

import Link from "next/link";
import { TipoVeiculo } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import { MoreHorizontalIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import {
  ativarVeiculo,
  desativarVeiculo,
  excluirVeiculo,
} from "@/app/(admin)/cadastros/veiculos/_actions";
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
  useVeiculos,
  type VeiculoFiltrosHook,
  type VeiculoListagemItem,
} from "@/hooks/useVeiculos";

type AcaoConfirmacao = "desativar" | "ativar" | "excluir";
type Ordenacao = NonNullable<VeiculoFiltrosHook["ordenarPor"]>;

const opcoesOrdenacao: { value: Ordenacao; label: string }[] = [
  { value: "MODELO_ASC", label: "Modelo A-Z" },
  { value: "MODELO_DESC", label: "Modelo Z-A" },
  { value: "PLACA_ASC", label: "Placa A-Z" },
  { value: "PLACA_DESC", label: "Placa Z-A" },
  { value: "CAPACIDADE_ASC", label: "Menor capacidade" },
  { value: "CAPACIDADE_DESC", label: "Maior capacidade" },
  { value: "CRIADO_EM_DESC", label: "Mais recentes" },
  { value: "CRIADO_EM_ASC", label: "Mais antigos" },
];

const opcoesTipo: { value: TipoVeiculo; label: string }[] = [
  { value: TipoVeiculo.CARRO_PASSEIO, label: "Carro de passeio" },
  { value: TipoVeiculo.VAN, label: "Van" },
  { value: TipoVeiculo.MICRO_ONIBUS, label: "Micro-ônibus" },
  { value: TipoVeiculo.ONIBUS, label: "Ônibus" },
  { value: TipoVeiculo.OUTRO, label: "Outro" },
];

function labelTipo(tipo: string) {
  return opcoesTipo.find((opcao) => opcao.value === tipo)?.label ?? tipo;
}

function textoCapacidade(capacidade: number) {
  return `${capacidade} passageiro${capacidade === 1 ? "" : "s"}`;
}

export default function VeiculosListagem() {
  const [buscaDigitada, setBuscaDigitada] = useState("");
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState<TipoVeiculo | undefined>();
  const [incluirInativos, setIncluirInativos] = useState(false);
  const [ordenarPor, setOrdenarPor] = useState<Ordenacao>("MODELO_ASC");
  const [pagina, setPagina] = useState(1);

  const [acaoPendente, setAcaoPendente] = useState<AcaoConfirmacao | null>(
    null,
  );
  const [veiculoSelecionado, setVeiculoSelecionado] =
    useState<VeiculoListagemItem | null>(null);
  const [mostrarDialogoEmUso, setMostrarDialogoEmUso] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setBusca(buscaDigitada.trim());
      setPagina(1);
    }, 300);

    return () => clearTimeout(timeout);
  }, [buscaDigitada]);

  const filtros = useMemo<VeiculoFiltrosHook>(
    () => ({
      busca,
      tipo,
      incluirInativos,
      ordenarPor,
      pagina,
      tamanho: 10,
    }),
    [busca, tipo, incluirInativos, ordenarPor, pagina],
  );

  const { data, isLoading, isFetching, refetch } = useVeiculos(filtros);

  const veiculos = data?.itens ?? [];
  const totalPaginas = data?.totalPaginas ?? 1;

  function abrirConfirmacao(
    acao: AcaoConfirmacao,
    veiculo: VeiculoListagemItem,
  ) {
    setVeiculoSelecionado(veiculo);
    setAcaoPendente(acao);
  }

  function fecharConfirmacao() {
    setAcaoPendente(null);
    setVeiculoSelecionado(null);
  }

  async function executarAcaoConfirmada() {
    if (!acaoPendente || !veiculoSelecionado) {
      return;
    }

    const id = veiculoSelecionado.id;

    if (acaoPendente === "desativar") {
      const resposta = await desativarVeiculo(id);
      if (!resposta.success) {
        toast.error(resposta.error.message);
        return;
      }

      toast.success("Veículo desativado com sucesso.");
      await refetch();
      return;
    }

    if (acaoPendente === "ativar") {
      const resposta = await ativarVeiculo(id);
      if (!resposta.success) {
        toast.error(resposta.error.message);
        return;
      }

      toast.success("Veículo ativado com sucesso.");
      await refetch();
      return;
    }

    const resposta = await excluirVeiculo(id);
    if (!resposta.success) {
      if (resposta.error.code === "EM_USO") {
        setMostrarDialogoEmUso(true);
        return;
      }

      toast.error(resposta.error.message);
      return;
    }

    toast.success("Veículo excluído com sucesso.");
    await refetch();
  }

  async function desativarAposBloqueioExclusao() {
    if (!veiculoSelecionado) {
      return;
    }

    const resposta = await desativarVeiculo(veiculoSelecionado.id);
    if (!resposta.success) {
      toast.error(resposta.error.message);
      return;
    }

    toast.success("Veículo desativado com sucesso.");
    setMostrarDialogoEmUso(false);
    fecharConfirmacao();
    await refetch();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Veículos">
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Gerencie a frota própria e acompanhe o tipo e a capacidade de cada
            veículo.
          </p>
          <Button asChild>
            <Link href="/cadastros/veiculos/novo">
              <PlusIcon className="size-4" />
              Novo veículo
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
            <label className="text-sm font-medium" htmlFor="busca-veiculos">
              Busca
            </label>
            <Input
              id="busca-veiculos"
              placeholder="Buscar por placa, modelo, marca ou tipo"
              value={buscaDigitada}
              onChange={(event) => setBuscaDigitada(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="tipo-veiculo">
              Tipo
            </label>
            <Select
              value={tipo ?? "TODOS"}
              onValueChange={(value) => {
                setTipo(value === "TODOS" ? undefined : (value as TipoVeiculo));
                setPagina(1);
              }}
            >
              <SelectTrigger id="tipo-veiculo" className="w-full">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos</SelectItem>
                {opcoesTipo.map((opcao) => (
                  <SelectItem key={opcao.value} value={opcao.value}>
                    {opcao.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium" htmlFor="ordenacao-veiculos">
              Ordenação
            </label>
            <Select
              value={ordenarPor}
              onValueChange={(value) => {
                setOrdenarPor(value as Ordenacao);
                setPagina(1);
              }}
            >
              <SelectTrigger id="ordenacao-veiculos" className="w-full">
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
              id="mostrar-inativos-veiculos"
              checked={incluirInativos}
              onCheckedChange={(checked) => {
                setIncluirInativos(checked);
                setPagina(1);
              }}
            />
            <label className="text-sm" htmlFor="mostrar-inativos-veiculos">
              Mostrar inativos
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">
              Carregando veículos...
            </p>
          ) : veiculos.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhum veículo encontrado.
              </p>
              <Button asChild>
                <Link href="/cadastros/veiculos/novo">
                  Cadastrar primeiro veículo
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Placa</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Ano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {veiculos.map((veiculo) => (
                    <TableRow key={veiculo.id}>
                      <TableCell className="font-medium">
                        {veiculo.placa}
                      </TableCell>
                      <TableCell>{veiculo.modelo}</TableCell>
                      <TableCell>{veiculo.marca}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-2">
                          <span>{labelTipo(veiculo.tipo)}</span>
                          <Badge variant="outline">
                            {textoCapacidade(veiculo.capacidade)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{veiculo.ano}</TableCell>
                      <TableCell>
                        <Badge
                          variant={veiculo.ativo ? "secondary" : "outline"}
                        >
                          {veiculo.ativo ? "Ativo" : "Inativo"}
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
                              <Link href={`/cadastros/veiculos/${veiculo.id}`}>
                                Ver
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/cadastros/veiculos/${veiculo.id}?editar=1`}
                              >
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            {veiculo.ativo ? (
                              <DropdownMenuItem
                                onSelect={(event) => {
                                  event.preventDefault();
                                  abrirConfirmacao("desativar", veiculo);
                                }}
                              >
                                Desativar
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onSelect={(event) => {
                                  event.preventDefault();
                                  abrirConfirmacao("ativar", veiculo);
                                }}
                              >
                                Ativar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onSelect={(event) => {
                                event.preventDefault();
                                abrirConfirmacao("excluir", veiculo);
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
                  {data?.total ?? 0} veículo(s) encontrado(s)
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
        aberto={Boolean(acaoPendente && veiculoSelecionado)}
        onAbertoChange={(aberto) => {
          if (!aberto) {
            fecharConfirmacao();
          }
        }}
        titulo={
          acaoPendente === "desativar"
            ? "Desativar veículo"
            : acaoPendente === "ativar"
              ? "Ativar veículo"
              : "Excluir veículo"
        }
        descricao={
          acaoPendente === "desativar"
            ? "O veículo deixará de aparecer nos seletores padrão das próximas escalas."
            : acaoPendente === "ativar"
              ? "O veículo voltará a aparecer nos seletores padrão das escalas."
              : "Esta ação remove o veículo definitivamente quando não houver atendimentos vinculados."
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
        titulo="Veículo em uso"
        descricao="Este veículo possui atendimentos vinculados e não pode ser excluído. Deseja desativar o cadastro em vez de excluir?"
        textoConfirmar="Desativar veículo"
        textoCancelar="Fechar"
        onConfirmar={desativarAposBloqueioExclusao}
      />
    </div>
  );
}
