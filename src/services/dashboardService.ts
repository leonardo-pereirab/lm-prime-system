import { prisma } from "@/lib/prisma";
import type { Prisma, StatusAtendimento } from "@prisma/client";
import type { DashboardPeriodo } from "@/lib/dashboard-periodo";

type DashboardTopItem = {
  id: string;
  nome: string;
  total: number;
};

type DashboardHistoricoServico = {
  id: string;
  codigo: string | null;
  dataServico: Date | null;
  updatedAt: Date;
  cliente: {
    id: string;
    nome: string;
    cpfCnpj: string;
  } | null;
  leadNome: string | null;
};

const STATUS_CANCELADOS: StatusAtendimento[] = [
  "ORCAMENTO_CANCELADO",
  "RESERVA_CANCELADA",
  "ATENDIMENTO_CANCELADO",
];

function filtroPeriodo(
  periodo: DashboardPeriodo,
): Prisma.AtendimentoWhereInput {
  return {
    createdAt: {
      gte: periodo.inicio,
      lte: periodo.fim,
    },
  };
}

export const dashboardService = {
  async obterIndicadores(periodo: DashboardPeriodo) {
    const whereBase = filtroPeriodo(periodo);

    const whereAbertos = {
      ...whereBase,
      status: {
        in: [
          "EM_SOLICITACAO",
          "AGUARDANDO_ORCAMENTO",
          "ORCAMENTO_REGISTRADO_AG_APROVACAO",
          "AGUARDANDO_RESERVA",
          "RESERVA_REGISTRADA_AG_ESCALA",
          "ESCALA_DEFINIDA",
          "SERVICO_EM_ANDAMENTO",
        ] satisfies StatusAtendimento[],
      },
    } satisfies Prisma.AtendimentoWhereInput;

    const [
      totalAtendimentos,
      totalOrcamentos,
      totalReservas,
      totalServicos,
      totalAbertos,
      cancelamentos,
      cancelamentosPorEtapa,
      historicoServicos,
    ] = await Promise.all([
      prisma.atendimento.count({ where: whereBase }),
      prisma.atendimento.count({
        where: {
          ...whereBase,
          orcamento: { isNot: null },
        },
      }),
      prisma.atendimento.count({
        where: {
          ...whereBase,
          reserva: { isNot: null },
        },
      }),
      prisma.atendimento.count({
        where: { ...whereBase, status: "SERVICO_FINALIZADO" },
      }),
      prisma.atendimento.count({ where: whereAbertos }),
      prisma.atendimento.count({
        where: {
          ...whereBase,
          status: { in: STATUS_CANCELADOS },
        },
      }),
      prisma.atendimento.groupBy({
        by: ["statusAnteriorCancelamento"],
        _count: { _all: true },
        where: {
          ...whereBase,
          status: { in: STATUS_CANCELADOS },
          statusAnteriorCancelamento: { not: null },
        },
      }),
      prisma.atendimento.findMany({
        where: {
          ...whereBase,
          status: "SERVICO_FINALIZADO",
        },
        select: {
          id: true,
          codigo: true,
          dataServico: true,
          updatedAt: true,
          leadNome: true,
          cliente: {
            select: {
              id: true,
              nome: true,
              cpfCnpj: true,
            },
          },
        },
        orderBy: [{ dataServico: "desc" }, { updatedAt: "desc" }],
        take: 10,
      }),
    ]);

    const totalSolicitacoes = totalAtendimentos;

    return {
      totalAtendimentos,
      totais: {
        abertos: totalAbertos,
        finalizados: totalServicos,
        cancelados: cancelamentos,
      },
      totalSolicitacoes,
      totalOrcamentos,
      totalReservas,
      totalServicos,
      cancelamentos,
      conversoes: {
        atendimentoParaServico:
          totalAtendimentos > 0
            ? Number((totalServicos / totalAtendimentos).toFixed(4))
            : 0,
        solicitacaoParaOrcamento:
          totalSolicitacoes > 0
            ? Number((totalOrcamentos / totalSolicitacoes).toFixed(4))
            : 0,
        orcamentoParaReserva:
          totalOrcamentos > 0
            ? Number((totalReservas / totalOrcamentos).toFixed(4))
            : 0,
        reservaParaServico:
          totalReservas > 0
            ? Number((totalServicos / totalReservas).toFixed(4))
            : 0,
      },
      cancelamentosPorEtapa: cancelamentosPorEtapa.map((item) => ({
        etapa: item.statusAnteriorCancelamento,
        total: item._count._all,
      })),
      topRecursos: {
        motoristas: await this.topMotoristas(periodo),
        veiculos: await this.topVeiculos(periodo),
        parceiros: await this.topParceiros(periodo),
      },
      historicoServicos: historicoServicos as DashboardHistoricoServico[],
    };
  },

  async topMotoristas(
    periodo: DashboardPeriodo,
    n = 5,
  ): Promise<DashboardTopItem[]> {
    const itens = await prisma.escalaMotorista.groupBy({
      by: ["motoristaId"],
      _count: { _all: true },
      where: {
        escala: {
          atendimento: {
            createdAt: {
              gte: periodo.inicio,
              lte: periodo.fim,
            },
          },
        },
      },
      orderBy: { _count: { motoristaId: "desc" } },
      take: n,
    });

    const motoristas = await prisma.motorista.findMany({
      where: { id: { in: itens.map((item) => item.motoristaId) } },
      select: { id: true, nome: true },
    });

    return itens.map((item) => {
      const motorista = motoristas.find(
        (registro) => registro.id === item.motoristaId,
      );
      return {
        id: item.motoristaId,
        nome: motorista?.nome ?? "Motorista removido",
        total: item._count._all,
      };
    });
  },

  async topVeiculos(
    periodo: DashboardPeriodo,
    n = 5,
  ): Promise<DashboardTopItem[]> {
    const itens = await prisma.escalaVeiculo.groupBy({
      by: ["veiculoId"],
      _count: { _all: true },
      where: {
        escala: {
          atendimento: {
            createdAt: {
              gte: periodo.inicio,
              lte: periodo.fim,
            },
          },
        },
      },
      orderBy: { _count: { veiculoId: "desc" } },
      take: n,
    });

    const veiculos = await prisma.veiculo.findMany({
      where: { id: { in: itens.map((item) => item.veiculoId) } },
      select: { id: true, modelo: true, placa: true },
    });

    return itens.map((item) => {
      const veiculo = veiculos.find(
        (registro) => registro.id === item.veiculoId,
      );
      return {
        id: item.veiculoId,
        nome: veiculo
          ? `${veiculo.modelo} (${veiculo.placa})`
          : "Veículo removido",
        total: item._count._all,
      };
    });
  },

  async topParceiros(
    periodo: DashboardPeriodo,
    n = 5,
  ): Promise<DashboardTopItem[]> {
    const itens = await prisma.escalaParceiro.groupBy({
      by: ["parceiroId"],
      _count: { _all: true },
      where: {
        escala: {
          atendimento: {
            createdAt: {
              gte: periodo.inicio,
              lte: periodo.fim,
            },
          },
        },
      },
      orderBy: { _count: { parceiroId: "desc" } },
      take: n,
    });

    const parceiros = await prisma.parceiro.findMany({
      where: { id: { in: itens.map((item) => item.parceiroId) } },
      select: { id: true, nome: true },
    });

    return itens.map((item) => {
      const parceiro = parceiros.find(
        (registro) => registro.id === item.parceiroId,
      );
      return {
        id: item.parceiroId,
        nome: parceiro?.nome ?? "Parceiro removido",
        total: item._count._all,
      };
    });
  },
};
