"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  ArchiveIcon,
  CalendarIcon,
  ChevronDownIcon,
  DownloadIcon,
  EyeIcon,
  XIcon,
} from "lucide-react";
import { format } from "date-fns";

import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Calendar } from "@/components/ui/Calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/Command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
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
  useArquivarContrato,
  useContratos,
  type ContratoFiltrosHook,
  type ContratoListagemItem,
} from "@/hooks/useContratos";
import { useClientes } from "@/hooks/useClientes";
import { formatarData, formatarDataHora } from "@/lib/format";

type ClienteSelecionado = {
  id: string;
  nome: string;
};

function formatarDataQuery(data?: Date) {
  if (!data) {
    return undefined;
  }

  return format(data, "yyyy-MM-dd");
}

function nomeCliente(contrato: ContratoListagemItem) {
  return contrato.atendimento.cliente?.nome ?? "Sem cliente";
}

function DateRangePicker({
  valor,
  onChange,
}: {
  valor?: DateRange;
  onChange: (valor?: DateRange) => void;
}) {
  const descricao =
    valor?.from && valor?.to
      ? `${formatarData(valor.from)} ate ${formatarData(valor.to)}`
      : valor?.from
        ? `${formatarData(valor.from)} ate ...`
        : "Selecionar periodo";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between font-normal"
        >
          <span className="flex items-center gap-2 truncate">
            <CalendarIcon className="size-4" />
            {descricao}
          </span>
          <ChevronDownIcon className="size-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={valor}
          onSelect={onChange}
        />
        <div className="flex justify-end border-t p-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(undefined)}
          >
            Limpar periodo
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ClienteCombobox({
  valor,
  onChange,
}: {
  valor: ClienteSelecionado | null;
  onChange: (valor: ClienteSelecionado | null) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const { data, isFetching } = useClientes({
    busca: busca.trim() || undefined,
    pagina: 1,
    tamanho: 20,
  });

  const clientes = data?.itens ?? [];

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between font-normal"
        >
          <span className="truncate">
            {valor?.nome ?? "Selecionar cliente"}
          </span>
          <ChevronDownIcon className="size-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[320px] p-0">
        <Command>
          <CommandInput
            placeholder="Buscar cliente por nome"
            value={busca}
            onValueChange={setBusca}
          />
          <CommandList>
            <CommandEmpty>
              {isFetching
                ? "Carregando clientes..."
                : "Nenhum cliente encontrado."}
            </CommandEmpty>
            <CommandGroup>
              {valor ? (
                <CommandItem
                  key="limpar-cliente"
                  value="limpar-cliente"
                  onSelect={() => {
                    onChange(null);
                    setAberto(false);
                  }}
                >
                  Limpar filtro
                </CommandItem>
              ) : null}
              {clientes.map((cliente) => (
                <CommandItem
                  key={cliente.id}
                  value={`${cliente.nome} ${cliente.cpfCnpj}`}
                  onSelect={() => {
                    onChange({ id: cliente.id, nome: cliente.nome });
                    setAberto(false);
                  }}
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate">{cliente.nome}</span>
                    <span className="text-xs text-muted-foreground">
                      {cliente.cpfCnpj}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function ContratosListagem() {
  const [clienteSelecionado, setClienteSelecionado] =
    useState<ClienteSelecionado | null>(null);
  const [periodo, setPeriodo] = useState<DateRange | undefined>();
  const [mostrarArquivados, setMostrarArquivados] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [dialogArquivar, setDialogArquivar] = useState<string | null>(null);

  const filtros = useMemo<ContratoFiltrosHook>(
    () => ({
      clienteId: clienteSelecionado?.id,
      periodoInicio: formatarDataQuery(periodo?.from),
      periodoFim: formatarDataQuery(periodo?.to),
      incluirInativos: mostrarArquivados,
      pagina,
      tamanho: 10,
    }),
    [
      clienteSelecionado?.id,
      mostrarArquivados,
      pagina,
      periodo?.from,
      periodo?.to,
    ],
  );

  const { data, isLoading, isFetching } = useContratos(filtros);
  const { mutateAsync: arquivar, isPending: arquivando } =
    useArquivarContrato();

  const contratos = data?.itens ?? [];
  const total = data?.total ?? 0;
  const totalPaginas = data?.totalPaginas ?? 1;

  function limparFiltros() {
    setClienteSelecionado(null);
    setPeriodo(undefined);
    setMostrarArquivados(false);
    setPagina(1);
  }

  async function confirmarArquivar() {
    if (!dialogArquivar) return;
    await arquivar(dialogArquivar);
    setDialogArquivar(null);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Cliente</label>
            <ClienteCombobox
              valor={clienteSelecionado}
              onChange={(valor) => {
                setClienteSelecionado(valor);
                setPagina(1);
              }}
            />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <label className="text-sm font-medium">Periodo de geracao</label>
            <DateRangePicker
              valor={periodo}
              onChange={(valor) => {
                setPeriodo(valor);
                setPagina(1);
              }}
            />
          </div>

          <div className="flex items-end justify-between gap-4 lg:col-span-1">
            <div className="flex items-center gap-2">
              <Switch
                id="mostrar-arquivados"
                checked={mostrarArquivados}
                onCheckedChange={(checked) => {
                  setMostrarArquivados(checked);
                  setPagina(1);
                }}
              />
              <label
                htmlFor="mostrar-arquivados"
                className="cursor-pointer text-sm"
              >
                Incluir arquivados
              </label>
            </div>
            <Button type="button" variant="ghost" onClick={limparFiltros}>
              <XIcon className="size-4" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">
              Carregando contratos...
            </p>
          ) : contratos.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhum contrato encontrado com os filtros informados.
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Atendimento</TableHead>
                    <TableHead>Data do servico</TableHead>
                    <TableHead>Gerado em</TableHead>
                    <TableHead>Gerado por</TableHead>
                    <TableHead className="w-28 text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contratos.map((contrato) => (
                    <TableRow
                      key={contrato.id}
                      className={!contrato.ativo ? "opacity-50" : undefined}
                    >
                      <TableCell>{nomeCliente(contrato)}</TableCell>
                      <TableCell>
                        <Link
                          href={`/atendimentos/${contrato.atendimentoId}/contrato`}
                          className="text-sm font-medium hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {contrato.atendimento.codigo ??
                            contrato.atendimentoId.slice(0, 8)}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {contrato.atendimento.dataServico
                          ? formatarData(contrato.atendimento.dataServico)
                          : "Nao definida"}
                      </TableCell>
                      <TableCell>
                        {formatarDataHora(contrato.geradoEm)}
                      </TableCell>
                      <TableCell>
                        {contrato.geradoPorUsuario?.nome ?? "Sistema"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Visualizar contrato"
                            asChild
                          >
                            <a
                              href={`/api/contratos/${contrato.id}/download?disposition=inline`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <EyeIcon className="size-4" />
                            </a>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Baixar contrato"
                            asChild
                          >
                            <a
                              href={`/api/contratos/${contrato.id}/download?disposition=attachment`}
                            >
                              <DownloadIcon className="size-4" />
                            </a>
                          </Button>
                          {contrato.ativo ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Arquivar contrato"
                              onClick={() => setDialogArquivar(contrato.id)}
                            >
                              <ArchiveIcon className="size-4" />
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between gap-4 border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  {total} contrato(s) encontrado(s)
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
        aberto={dialogArquivar !== null}
        onAbertoChange={(aberto) => {
          if (!aberto) setDialogArquivar(null);
        }}
        titulo="Arquivar contrato"
        descricao="O contrato sera marcado como inativo e nao aparecera nos filtros padrao. Voce pode exibi-lo ativando a opcao 'Incluir arquivados'."
        textoConfirmar="Arquivar"
        varianteConfirmar="destructive"
        carregando={arquivando}
        onConfirmar={confirmarArquivar}
      />
    </>
  );
}
