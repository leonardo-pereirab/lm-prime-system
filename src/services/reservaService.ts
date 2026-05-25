import {
  InvalidTransitionError,
  NotFoundError,
  ValidationError,
} from "@/domain/errors";
import { podeTransicionar } from "@/domain/status";
import { prisma } from "@/lib/prisma";
import {
  reservaRepository,
  type ReservaFiltros,
} from "@/repositories/reservaRepository";
import type { ReservaInput, ReservaUpdate } from "@/schemas/reserva";
import type { Prisma } from "@prisma/client";

function normalizarData(data?: Date | string | null): Date | undefined {
  if (!data) {
    return undefined;
  }

  return data instanceof Date ? data : new Date(data);
}

export const reservaService = {
  async listar(filtros: ReservaFiltros = {}) {
    return reservaRepository.listar(filtros);
  },

  async listarTodos() {
    return this.listar();
  },

  async buscarPorId(id: string) {
    const reserva = await reservaRepository.buscarPorId(id);

    if (!reserva) {
      throw new NotFoundError(
        "RESERVA_NAO_ENCONTRADA",
        "Reserva não encontrada.",
      );
    }

    return reserva;
  },

  async buscarPorAtendimento(atendimentoId: string) {
    const reserva =
      await reservaRepository.buscarPorAtendimentoId(atendimentoId);

    if (!reserva) {
      throw new NotFoundError(
        "RESERVA_NAO_ENCONTRADA",
        "Reserva não encontrada para o atendimento.",
      );
    }

    return reserva;
  },

  async criar(
    atendimentoIdOuDados: string | Prisma.ReservaUncheckedCreateInput,
    input?: ReservaInput,
  ) {
    if (typeof atendimentoIdOuDados === "string" && !input) {
      throw new ValidationError(
        "DADOS_RESERVA_OBRIGATORIOS",
        "Dados da reserva são obrigatórios.",
      );
    }

    const atendimentoId =
      typeof atendimentoIdOuDados === "string"
        ? atendimentoIdOuDados
        : atendimentoIdOuDados.atendimentoId;

    const dadosReserva: ReservaInput =
      typeof atendimentoIdOuDados === "string"
        ? (input as ReservaInput)
        : {
            confirmadaEm: normalizarData(atendimentoIdOuDados.confirmadaEm),
            observacoes: atendimentoIdOuDados.observacoes ?? undefined,
          };

    const atendimento = await prisma.atendimento.findUnique({
      where: { id: atendimentoId },
      select: {
        id: true,
        status: true,
        clienteId: true,
        leadNome: true,
        leadTelefone: true,
      },
    });

    if (!atendimento) {
      throw new NotFoundError(
        "ATENDIMENTO_NAO_ENCONTRADO",
        "Atendimento não encontrado.",
      );
    }

    if (!podeTransicionar(atendimento.status, "RESERVA_REGISTRADA_AG_ESCALA")) {
      throw new InvalidTransitionError(
        "TRANSICAO_INVALIDA",
        "Atendimento não está apto para registro de reserva.",
      );
    }

    return prisma.$transaction(async (tx) => {
      let clienteId = atendimento.clienteId;

      if (dadosReserva.clienteIdExistente) {
        const clienteExistente = await tx.cliente.findUnique({
          where: { id: dadosReserva.clienteIdExistente },
          select: { id: true },
        });

        if (!clienteExistente) {
          throw new NotFoundError(
            "CLIENTE_NAO_ENCONTRADO",
            "Cliente informado não foi encontrado.",
          );
        }

        clienteId = clienteExistente.id;
      }

      if (!clienteId) {
        if (!dadosReserva.novoCliente) {
          throw new ValidationError(
            "CLIENTE_OBRIGATORIO",
            "Para lead sem cliente cadastrado é obrigatório informar os dados completos do cliente.",
          );
        }

        const clientePorDocumento = await tx.cliente.findUnique({
          where: { cpfCnpj: dadosReserva.novoCliente.cpfCnpj },
          select: { id: true },
        });

        if (clientePorDocumento) {
          clienteId = clientePorDocumento.id;
        } else {
          const clienteCriado = await tx.cliente.create({
            data: dadosReserva.novoCliente,
          });
          clienteId = clienteCriado.id;
        }
      }

      if (!clienteId) {
        throw new ValidationError(
          "CLIENTE_OBRIGATORIO",
          "Não foi possível definir o cliente da reserva.",
        );
      }

      await tx.atendimento.update({
        where: { id: atendimentoId },
        data: { clienteId },
      });

      const reserva = await tx.reserva.create({
        data: {
          atendimentoId,
          confirmadaEm: dadosReserva.confirmadaEm,
          observacoes: dadosReserva.observacoes,
        },
      });

      await tx.atendimento.update({
        where: { id: atendimentoId },
        data: { status: "RESERVA_REGISTRADA_AG_ESCALA" },
      });

      return reserva;
    });
  },

  async atualizar(
    id: string,
    input: ReservaUpdate | Prisma.ReservaUncheckedUpdateInput,
  ) {
    const reserva = await this.buscarPorId(id);

    if (
      reserva.atendimento.status === "RESERVA_CANCELADA" ||
      reserva.atendimento.status === "ATENDIMENTO_CANCELADO"
    ) {
      throw new InvalidTransitionError(
        "RESERVA_CANCELADA",
        "Reserva cancelada não pode ser atualizada.",
      );
    }

    return reservaRepository.atualizar(id, {
      confirmadaEm: input.confirmadaEm,
      observacoes: input.observacoes,
    });
  },

  async cancelar(id: string, userId: string) {
    const reserva = await this.buscarPorId(id);

    if (!podeTransicionar(reserva.atendimento.status, "RESERVA_CANCELADA")) {
      throw new InvalidTransitionError(
        "TRANSICAO_INVALIDA",
        "Reserva não pode ser cancelada no status atual.",
      );
    }

    await prisma.atendimento.update({
      where: { id: reserva.atendimentoId },
      data: {
        status: "RESERVA_CANCELADA",
        statusAnteriorCancelamento: reserva.atendimento.status,
        canceladoEm: new Date(),
        canceladoPor: userId,
      },
    });

    return reserva;
  },
};
