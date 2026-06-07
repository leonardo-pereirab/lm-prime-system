"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import type { StatusAtendimento, TipoServico } from "@prisma/client";
import {
  CalendarIcon,
  ChevronDownIcon,
  EyeIcon,
  PlusIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import { format } from "date-fns";

import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
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
import { Input } from "@/components/ui/Input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
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
import { STATUS_COR, STATUS_LABELS, type StatusCor } from "@/domain/status";
import {
  useAtendimentos,
  type AtendimentoFiltrosHook,
  type AtendimentoListagemItem,
} from "@/hooks/useAtendimentos";
import { useClientes } from "@/hooks/useClientes";
import { formatarData, formatarDataHora } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_OPCOES = Object.entries(STATUS_LABELS) as Array<
  [StatusAtendimento, string]
>;

const TIPO_SERVICO_LABELS: Record<TipoServico, string> = {
  VIAGEM: "Viagem",
  EXCURSAO: "Excursão",
  PASSEIO: "Passeio",
  FEIRA: "Feira",
  CONVENCAO: "Convenção",
  CASAMENTO: "Casamento",
  TRANSFERE: "Transfere",
  OUTRO: "Outro",
};

const STATUS_BADGE_CLASSES: Record<StatusCor, string> = {
  neutral: "bg-muted text-foreground",
  info: "bg-info-600/10 text-info-600",
  warning: "bg-warning-600/10 text-warning-600",
  success: "bg-success-600/10 text-success-600",
  danger: "bg-danger-600/10 text-danger-600",
};

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

function nomeClienteOuLead(atendimento: AtendimentoListagemItem) {
  return atendimento.cliente?.nome ?? atendimento.leadNome ?? "Lead sem nome";
}

function detalheClienteOuLead(atendimento: AtendimentoListagemItem) {
  if (atendimento.cliente?.cpfCnpj) {
    return atendimento.cliente.cpfCnpj;
  }

  if (atendimento.leadTelefone) {
    return atendimento.leadTelefone;
  }

  return "Sem documento ou telefone";
}

function StatusAtendimentoBadge({ status }: { status: StatusAtendimento }) {
  const cor = STATUS_COR[status];

  return (
    <Badge
      variant="outline"
      className={cn("gap-2 border-transparent", STATUS_BADGE_CLASSES[cor])}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {STATUS_LABELS[status]}
    </Badge>
  );
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
      ? `${formatarData(valor.from)} até ${formatarData(valor.to)}`
      : valor?.from
        ? `${formatarData(valor.from)} até ...`
        : "Selecionar período";

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
            Limpar período
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

export default function AtendimentosListagem() {
  const router = useRouter();
  const [buscaDigitada, setBuscaDigitada] = useState("");
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<StatusAtendimento | "todos">("todos");
  const [clienteSelecionado, setClienteSelecionado] =
    useState<ClienteSelecionado | null>(null);
  const [periodo, setPeriodo] = useState<DateRange | undefined>();
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setBusca(buscaDigitada.trim());
      setPagina(1);
    }, 300);

    return () => clearTimeout(timeout);
  }, [buscaDigitada]);

  const filtros = useMemo<AtendimentoFiltrosHook>(
    () => ({
      busca,
      status: status === "todos" ? undefined : status,
      clienteId: clienteSelecionado?.id,
      dataInicio: formatarDataQuery(periodo?.from),
      dataFim: formatarDataQuery(periodo?.to),
      pagina,
      tamanho: 10,
    }),
    [busca, clienteSelecionado?.id, pagina, periodo?.from, periodo?.to, status],
  );

  const { data, isLoading, isFetching } = useAtendimentos(filtros);

  const atendimentos = data?.itens ?? [];
  const total = data?.total ?? 0;
  const totalPaginas = data?.totalPaginas ?? 1;

  function limparFiltros() {
    setBuscaDigitada("");
    setBusca("");
    setStatus("todos");
    setClienteSelecionado(null);
    setPeriodo(undefined);
    setPagina(1);
  }

  function abrirAtendimento(id: string) {
    router.push(`/atendimentos/${id}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Atendimentos">
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Acompanhe o funíl operacional desde a solicitação até a execução do
            serviço.
          </p>
          <Button asChild>
            <Link href="/atendimentos/novo">
              <PlusIcon className="size-4" />
              Novo atendimento
            </Link>
          </Button>
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-4">
          <div className="space-y-2 lg:col-span-2">
            <label className="text-sm font-medium" htmlFor="busca-atendimentos">
              Busca
            </label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="busca-atendimentos"
                className="pl-8"
                placeholder="Buscar por código, cliente ou lead"
                value={buscaDigitada}
                onChange={(event) => setBuscaDigitada(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              htmlFor="status-atendimentos"
            >
              Status
            </label>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as StatusAtendimento | "todos");
                setPagina(1);
              }}
            >
              <SelectTrigger id="status-atendimentos" className="w-full">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                {STATUS_OPCOES.map(([valor, label]) => (
                  <SelectItem key={valor} value={valor}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
            <label className="text-sm font-medium">Período do serviço</label>
            <DateRangePicker
              valor={periodo}
              onChange={(valor) => {
                setPeriodo(valor);
                setPagina(1);
              }}
            />
          </div>

          <div className="flex items-end justify-end lg:col-span-2">
            <Button type="button" variant="ghost" onClick={limparFiltros}>
              <XIcon className="size-4" />
              Limpar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">
              Carregando atendimentos...
            </p>
          ) : atendimentos.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhum atendimento encontrado com os filtros informados.
              </p>
              <Button asChild>
                <Link href="/atendimentos/novo">Novo atendimento</Link>
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Cliente/Lead</TableHead>
                    <TableHead>Tipo de serviço</TableHead>
                    <TableHead>Data do serviço</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="w-20 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {atendimentos.map((atendimento) => (
                    <TableRow
                      key={atendimento.id}
                      className="cursor-pointer"
                      tabIndex={0}
                      onClick={() => abrirAtendimento(atendimento.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          abrirAtendimento(atendimento.id);
                        }
                      }}
                    >
                      <TableCell className="font-medium">
                        {atendimento.codigo ?? "Sem codigo"}
                      </TableCell>
                      <TableCell>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate">
                            {nomeClienteOuLead(atendimento)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {detalheClienteOuLead(atendimento)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {TIPO_SERVICO_LABELS[atendimento.tipoServico] ??
                          atendimento.tipoServico}
                      </TableCell>
                      <TableCell>
                        {atendimento.dataServico
                          ? formatarData(atendimento.dataServico)
                          : "Não definida"}
                      </TableCell>
                      <TableCell>
                        <StatusAtendimentoBadge status={atendimento.status} />
                      </TableCell>
                      <TableCell>
                        {formatarDataHora(atendimento.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Ver atendimento ${atendimento.codigo ?? atendimento.id}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            abrirAtendimento(atendimento.id);
                          }}
                        >
                          <EyeIcon className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between gap-4 border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  {total} atendimento(s) encontrado(s)
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
    </div>
  );
}
