import { prisma } from "@/lib/prisma";
import type { Prisma, TipoVeiculo } from "@prisma/client";

export type EscalaFiltros = {
  atendimentoId?: string;
  pagina?: number;
  tamanho?: number;
};

export type DefinirEscalaPayload = {
  motoristasIds: string[];
  veiculosIds: string[];
  parceiros: Array<{
    parceiroId: string;
    qtdVeiculos: number;
    tipoVeiculo: TipoVeiculo;
    valorRepasse: Prisma.Decimal | number | string;
    observacoes?: string;
  }>;
};

function montarWhere(filtros: Omit<EscalaFiltros, "pagina" | "tamanho">) {
  const { atendimentoId } = filtros;

  return {
    ...(atendimentoId && { atendimentoId }),
  } satisfies Prisma.EscalaWhereInput;
}

export const escalaRepository = {
  listar(filtros: EscalaFiltros = {}) {
    const { pagina = 1, tamanho = 20 } = filtros;

    return prisma.escala.findMany({
      where: montarWhere(filtros),
      include: {
        atendimento: {
          select: {
            id: true,
            codigo: true,
            status: true,
            dataServico: true,
          },
        },
        motoristas: {
          include: {
            motorista: true,
          },
        },
        veiculos: {
          include: {
            veiculo: true,
          },
        },
        parceiros: {
          include: {
            parceiro: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (pagina - 1) * tamanho,
      take: tamanho,
    });
  },

  buscarPorId(id: string) {
    return prisma.escala.findUnique({
      where: { id },
      include: {
        atendimento: true,
        motoristas: { include: { motorista: true } },
        veiculos: { include: { veiculo: true } },
        parceiros: { include: { parceiro: true } },
      },
    });
  },

  buscarPorAtendimento(atendimentoId: string) {
    return prisma.escala.findUnique({
      where: { atendimentoId },
      include: {
        motoristas: { include: { motorista: true } },
        veiculos: { include: { veiculo: true } },
        parceiros: { include: { parceiro: true } },
      },
    });
  },

  criar(dados: Prisma.EscalaCreateInput | Prisma.EscalaUncheckedCreateInput) {
    return prisma.escala.create({ data: dados });
  },

  atualizar(
    id: string,
    dados: Prisma.EscalaUpdateInput | Prisma.EscalaUncheckedUpdateInput,
  ) {
    return prisma.escala.update({ where: { id }, data: dados });
  },

  definir(escalaId: string, payload: DefinirEscalaPayload) {
    return prisma.$transaction(async (tx) => {
      await tx.escalaMotorista.deleteMany({ where: { escalaId } });
      await tx.escalaVeiculo.deleteMany({ where: { escalaId } });
      await tx.escalaParceiro.deleteMany({ where: { escalaId } });

      if (payload.motoristasIds.length > 0) {
        await tx.escalaMotorista.createMany({
          data: payload.motoristasIds.map((motoristaId) => ({
            escalaId,
            motoristaId,
          })),
        });
      }

      if (payload.veiculosIds.length > 0) {
        await tx.escalaVeiculo.createMany({
          data: payload.veiculosIds.map((veiculoId) => ({
            escalaId,
            veiculoId,
          })),
        });
      }

      if (payload.parceiros.length > 0) {
        await tx.escalaParceiro.createMany({
          data: payload.parceiros.map((item) => ({
            escalaId,
            parceiroId: item.parceiroId,
            qtdVeiculos: item.qtdVeiculos,
            tipoVeiculo: item.tipoVeiculo,
            valorRepasse: item.valorRepasse,
            observacoes: item.observacoes,
          })),
        });
      }

      return tx.escala.findUnique({
        where: { id: escalaId },
        include: {
          motoristas: { include: { motorista: true } },
          veiculos: { include: { veiculo: true } },
          parceiros: { include: { parceiro: true } },
        },
      });
    });
  },
};
