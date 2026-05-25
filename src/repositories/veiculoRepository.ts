import { prisma } from "@/lib/prisma";
import type { Prisma, TipoVeiculo } from "@prisma/client";

export type VeiculoFiltros = {
  busca?: string;
  tipo?: TipoVeiculo;
  apenasAtivos?: boolean;
  ordenarPor?: VeiculoOrdenacao;
  pagina?: number;
  tamanho?: number;
};

export type VeiculoOrdenacao =
  | "MODELO_ASC"
  | "MODELO_DESC"
  | "PLACA_ASC"
  | "PLACA_DESC"
  | "CAPACIDADE_ASC"
  | "CAPACIDADE_DESC"
  | "CRIADO_EM_DESC"
  | "CRIADO_EM_ASC";

function normalizarBuscaTipo(busca: string) {
  const texto = busca
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");

  const mapa: Record<string, TipoVeiculo> = {
    CARRO: "CARRO_PASSEIO",
    CARRO_PASSEIO: "CARRO_PASSEIO",
    PASSEIO: "CARRO_PASSEIO",
    VAN: "VAN",
    MICRO_ONIBUS: "MICRO_ONIBUS",
    MICROONIBUS: "MICRO_ONIBUS",
    ONIBUS: "ONIBUS",
    OUTRO: "OUTRO",
  };

  return mapa[texto];
}

function montarOrderBy(
  ordenarPor: VeiculoOrdenacao = "MODELO_ASC",
): Prisma.VeiculoOrderByWithRelationInput {
  switch (ordenarPor) {
    case "MODELO_DESC":
      return { modelo: "desc" };
    case "PLACA_ASC":
      return { placa: "asc" };
    case "PLACA_DESC":
      return { placa: "desc" };
    case "CAPACIDADE_ASC":
      return { capacidade: "asc" };
    case "CAPACIDADE_DESC":
      return { capacidade: "desc" };
    case "CRIADO_EM_DESC":
      return { createdAt: "desc" };
    case "CRIADO_EM_ASC":
      return { createdAt: "asc" };
    case "MODELO_ASC":
    default:
      return { modelo: "asc" };
  }
}

function montarWhere(
  filtros: Pick<VeiculoFiltros, "busca" | "tipo" | "apenasAtivos">,
) {
  const { busca, tipo, apenasAtivos = true } = filtros;
  const tipoPorBusca = busca ? normalizarBuscaTipo(busca) : undefined;

  return {
    ...(apenasAtivos && { ativo: true }),
    ...(tipo && { tipo }),
    ...(busca && {
      OR: [
        { placa: { contains: busca, mode: "insensitive" } },
        { modelo: { contains: busca, mode: "insensitive" } },
        { marca: { contains: busca, mode: "insensitive" } },
        ...(tipoPorBusca ? [{ tipo: tipoPorBusca }] : []),
      ],
    }),
  } satisfies Prisma.VeiculoWhereInput;
}

export const veiculoRepository = {
  listar(filtros: VeiculoFiltros = {}) {
    const { pagina = 1, tamanho = 20, ordenarPor = "MODELO_ASC" } = filtros;

    return prisma.veiculo.findMany({
      where: montarWhere(filtros),
      orderBy: [montarOrderBy(ordenarPor), { placa: "asc" }],
      skip: (pagina - 1) * tamanho,
      take: tamanho,
    });
  },

  contar(
    filtros: Pick<VeiculoFiltros, "busca" | "tipo" | "apenasAtivos"> = {},
  ) {
    return prisma.veiculo.count({ where: montarWhere(filtros) });
  },

  buscarPorId(id: string) {
    return prisma.veiculo.findUnique({ where: { id } });
  },

  buscarPorPlaca(placa: string) {
    return prisma.veiculo.findUnique({ where: { placa } });
  },

  criar(dados: Prisma.VeiculoCreateInput | Prisma.VeiculoUncheckedCreateInput) {
    return prisma.veiculo.create({ data: dados });
  },

  atualizar(
    id: string,
    dados: Prisma.VeiculoUpdateInput | Prisma.VeiculoUncheckedUpdateInput,
  ) {
    return prisma.veiculo.update({ where: { id }, data: dados });
  },

  ativar(id: string) {
    return prisma.veiculo.update({ where: { id }, data: { ativo: true } });
  },

  desativar(id: string) {
    return prisma.veiculo.update({ where: { id }, data: { ativo: false } });
  },

  contarAtendimentosVinculados(veiculoId: string) {
    return prisma.escalaVeiculo.count({
      where: {
        veiculoId,
        escala: {
          atendimento: {
            status: {
              notIn: [
                "ORCAMENTO_CANCELADO",
                "RESERVA_CANCELADA",
                "ATENDIMENTO_CANCELADO",
              ],
            },
          },
        },
      },
    });
  },

  excluir(id: string) {
    return prisma.veiculo.delete({ where: { id } });
  },
};
