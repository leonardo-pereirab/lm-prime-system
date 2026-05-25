import { ConflictError, NotFoundError } from "@/domain/errors";
import { motoristaRepository } from "@/repositories/motoristaRepository";
import type { MotoristaFiltros } from "@/repositories/motoristaRepository";
import type { MotoristaInput, MotoristaUpdate } from "@/schemas/motorista";
import type { Prisma } from "@prisma/client";

export const motoristaService = {
  async listar(filtros: MotoristaFiltros = {}) {
    return motoristaRepository.listar(filtros);
  },

  async listarPaginado(filtros: MotoristaFiltros = {}) {
    const { pagina = 1, tamanho = 20, ...restante } = filtros;

    const [itens, total] = await Promise.all([
      motoristaRepository.listar({ ...restante, pagina, tamanho }),
      motoristaRepository.contar(restante),
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
    const motorista = await motoristaRepository.buscarPorId(id);
    if (!motorista) {
      throw new NotFoundError(
        "MOTORISTA_NAO_ENCONTRADO",
        "Motorista não encontrado.",
      );
    }

    return motorista;
  },

  async criar(dados: MotoristaInput | Prisma.MotoristaUncheckedCreateInput) {
    return motoristaRepository.criar(dados);
  },

  async atualizar(
    id: string,
    dados: MotoristaUpdate | Prisma.MotoristaUncheckedUpdateInput,
  ) {
    await this.buscarPorId(id);
    return motoristaRepository.atualizar(id, dados);
  },

  async listarTodos() {
    return this.listar();
  },

  async listarComCnhVencendo(diasAntes = 30) {
    return motoristaRepository.listarComCnhVencendo(diasAntes);
  },

  async desativar(id: string) {
    await this.buscarPorId(id);
    return motoristaRepository.desativar(id);
  },

  async ativar(id: string) {
    await this.buscarPorId(id);
    return motoristaRepository.ativar(id);
  },

  async excluir(id: string) {
    await this.buscarPorId(id);
    const totalAtendimentos =
      await motoristaRepository.contarAtendimentosVinculados(id);

    if (totalAtendimentos > 0) {
      throw new ConflictError(
        "EM_USO",
        "Motorista possui atendimentos vinculados e não pode ser excluído.",
      );
    }

    return motoristaRepository.excluir(id);
  },

  async deletar(id: string) {
    return this.excluir(id);
  },
};
