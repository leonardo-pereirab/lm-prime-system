import { ConflictError, NotFoundError } from "@/domain/errors";
import { veiculoRepository } from "@/repositories/veiculoRepository";
import type { VeiculoFiltros } from "@/repositories/veiculoRepository";
import type { VeiculoInput, VeiculoUpdate } from "@/schemas/veiculo";
import type { Prisma } from "@prisma/client";

function normalizarPlaca(placa: string) {
  return placa.trim().toUpperCase();
}

export const veiculoService = {
  async listar(filtros: VeiculoFiltros = {}) {
    return veiculoRepository.listar(filtros);
  },

  async listarPaginado(filtros: VeiculoFiltros = {}) {
    const { pagina = 1, tamanho = 20, ...restante } = filtros;

    const [itens, total] = await Promise.all([
      veiculoRepository.listar({ ...restante, pagina, tamanho }),
      veiculoRepository.contar(restante),
    ]);

    return {
      itens,
      total,
      pagina,
      tamanho,
      totalPaginas: Math.max(1, Math.ceil(total / tamanho)),
    };
  },

  async buscarPorId(id: string) {
    const veiculo = await veiculoRepository.buscarPorId(id);
    if (!veiculo) {
      throw new NotFoundError(
        "VEICULO_NAO_ENCONTRADO",
        "Veículo não encontrado.",
      );
    }

    return veiculo;
  },

  async validarPlacaUnica(placa: string, veiculoId?: string) {
    const existente = await veiculoRepository.buscarPorPlaca(
      normalizarPlaca(placa),
    );

    if (existente && existente.id !== veiculoId) {
      throw new ConflictError(
        "PLACA_DUPLICADA",
        "Ja existe um veiculo cadastrado com esta placa.",
        { placa: "Ja existe um veiculo cadastrado com esta placa." },
      );
    }
  },

  async criar(dados: VeiculoInput | Prisma.VeiculoUncheckedCreateInput) {
    await this.validarPlacaUnica(dados.placa);

    return veiculoRepository.criar({
      ...dados,
      placa: normalizarPlaca(dados.placa),
    });
  },

  async atualizar(
    id: string,
    dados: VeiculoUpdate | Prisma.VeiculoUncheckedUpdateInput,
  ) {
    await this.buscarPorId(id);

    if (typeof dados.placa === "string") {
      await this.validarPlacaUnica(dados.placa, id);
    }

    return veiculoRepository.atualizar(id, {
      ...dados,
      ...(typeof dados.placa === "string"
        ? { placa: normalizarPlaca(dados.placa) }
        : {}),
    });
  },

  async listarTodos() {
    return this.listar();
  },

  async ativar(id: string) {
    await this.buscarPorId(id);
    return veiculoRepository.ativar(id);
  },

  async desativar(id: string) {
    await this.buscarPorId(id);
    return veiculoRepository.desativar(id);
  },

  async excluir(id: string) {
    await this.buscarPorId(id);
    const totalAtendimentos =
      await veiculoRepository.contarAtendimentosVinculados(id);

    if (totalAtendimentos > 0) {
      throw new ConflictError(
        "EM_USO",
        "Veículo possui atendimentos vinculados e não pode ser excluído.",
      );
    }

    return veiculoRepository.excluir(id);
  },

  async deletar(id: string) {
    return this.excluir(id);
  },
};
