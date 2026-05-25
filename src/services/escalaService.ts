import {
  InvalidTransitionError,
  NotFoundError,
  ValidationError,
} from "@/domain/errors";
import { podeTransicionar } from "@/domain/status";
import { prisma } from "@/lib/prisma";
import { escalaRepository } from "@/repositories/escalaRepository";
import type { EscalaInput } from "@/schemas/escala";
import type { Prisma, StatusAtendimento } from "@prisma/client";

const STATUS_BLOQUEADOS_EDICAO = new Set<StatusAtendimento>([
  "SERVICO_EM_ANDAMENTO",
  "SERVICO_FINALIZADO",
  "ATENDIMENTO_CANCELADO",
]);

function dataNoInicioDoDia(data: Date) {
  const normalizada = new Date(data);
  normalizada.setHours(0, 0, 0, 0);
  return normalizada;
}

export const escalaService = {
  async listar(filtros = {}) {
    return escalaRepository.listar(filtros);
  },

  async listarTodas() {
    return this.listar();
  },

  async buscarPorAtendimento(atendimentoId: string) {
    const escala = await escalaRepository.buscarPorAtendimento(atendimentoId);

    if (!escala) {
      throw new NotFoundError(
        "ESCALA_NAO_ENCONTRADA",
        "Escala não encontrada.",
      );
    }

    return escala;
  },

  async definir(atendimentoId: string, payload: EscalaInput) {
    const atendimento = await prisma.atendimento.findUnique({
      where: { id: atendimentoId },
      select: { id: true, status: true },
    });

    if (!atendimento) {
      throw new NotFoundError(
        "ATENDIMENTO_NAO_ENCONTRADO",
        "Atendimento não encontrado.",
      );
    }

    if (
      atendimento.status !== "ESCALA_DEFINIDA" &&
      !podeTransicionar(atendimento.status, "ESCALA_DEFINIDA")
    ) {
      throw new InvalidTransitionError(
        "TRANSICAO_INVALIDA",
        "Atendimento não está apto para definição de escala.",
      );
    }

    return prisma.$transaction(async (tx) => {
      const escalaExistente = await tx.escala.findUnique({
        where: { atendimentoId },
        select: { id: true },
      });

      const escala = escalaExistente
        ? await tx.escala.update({
            where: { id: escalaExistente.id },
            data: { observacoes: payload.observacoes },
            select: { id: true },
          })
        : await tx.escala.create({
            data: {
              atendimentoId,
              observacoes: payload.observacoes,
            },
            select: { id: true },
          });

      await tx.escalaMotorista.deleteMany({ where: { escalaId: escala.id } });
      await tx.escalaVeiculo.deleteMany({ where: { escalaId: escala.id } });
      await tx.escalaParceiro.deleteMany({ where: { escalaId: escala.id } });

      if (payload.motoristaIds.length > 0) {
        await tx.escalaMotorista.createMany({
          data: payload.motoristaIds.map((motoristaId) => ({
            escalaId: escala.id,
            motoristaId,
          })),
        });
      }

      if (payload.veiculoIds.length > 0) {
        await tx.escalaVeiculo.createMany({
          data: payload.veiculoIds.map((veiculoId) => ({
            escalaId: escala.id,
            veiculoId,
          })),
        });
      }

      if (payload.parceiros.length > 0) {
        await tx.escalaParceiro.createMany({
          data: payload.parceiros.map((parceiro) => ({
            escalaId: escala.id,
            parceiroId: parceiro.parceiroId,
            qtdVeiculos: parceiro.qtdVeiculos,
            tipoVeiculo: parceiro.tipoVeiculo,
            valorRepasse: parceiro.valorRepasse,
            observacoes: parceiro.observacoes,
          })),
        });
      }

      await tx.atendimento.update({
        where: { id: atendimentoId },
        data: { status: "ESCALA_DEFINIDA" },
      });

      return tx.escala.findUnique({
        where: { id: escala.id },
        include: {
          motoristas: { include: { motorista: true } },
          veiculos: { include: { veiculo: true } },
          parceiros: { include: { parceiro: true } },
        },
      });
    });
  },

  async atualizar(
    atendimentoId: string,
    payload: EscalaInput | Prisma.EscalaUncheckedUpdateInput,
  ) {
    if (!("motoristaIds" in payload) || !("veiculoIds" in payload)) {
      return escalaRepository.atualizar(atendimentoId, payload);
    }

    const atendimento = await prisma.atendimento.findUnique({
      where: { id: atendimentoId },
      select: { id: true, status: true, dataServico: true },
    });

    if (!atendimento) {
      throw new NotFoundError(
        "ATENDIMENTO_NAO_ENCONTRADO",
        "Atendimento não encontrado.",
      );
    }

    if (!atendimento.dataServico) {
      throw new ValidationError(
        "DATA_SERVICO_AUSENTE",
        "Atendimento sem data de serviço não pode ter escala atualizada.",
      );
    }

    if (STATUS_BLOQUEADOS_EDICAO.has(atendimento.status)) {
      throw new InvalidTransitionError(
        "EDICAO_BLOQUEADA",
        "Escala não pode ser editada no status atual do atendimento.",
      );
    }

    const hoje = dataNoInicioDoDia(new Date());
    const dataServico = dataNoInicioDoDia(new Date(atendimento.dataServico));

    if (dataServico < hoje) {
      throw new ValidationError(
        "DATA_SERVICO_INVALIDA",
        "Escala só pode ser editada até a data do serviço.",
      );
    }

    return this.definir(atendimentoId, payload);
  },

  async atribuir(dados: Prisma.EscalaUncheckedCreateInput) {
    return escalaRepository.criar(dados);
  },
};
