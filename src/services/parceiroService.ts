import { ConflictError, NotFoundError } from "@/domain/errors";
import { parceiroRepository } from "@/repositories/parceiroRepository";
import type { ParceiroFiltros } from "@/repositories/parceiroRepository";
import type { ParceiroInput, ParceiroUpdate } from "@/schemas/parceiro";
import type { Prisma } from "@prisma/client";

function normalizarCnpj(cnpj: string) {
  return cnpj.trim();
}

export const parceiroService = {
  async listar(filtros: ParceiroFiltros = {}) {
    return parceiroRepository.listar(filtros);
  },

  async listarPaginado(filtros: ParceiroFiltros = {}) {
    const { pagina = 1, tamanho = 20, ...restante } = filtros;

    const [itens, total] = await Promise.all([
      parceiroRepository.listar({ ...restante, pagina, tamanho }),
      parceiroRepository.contar(restante),
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
    const parceiro = await parceiroRepository.buscarPorId(id);
    if (!parceiro) {
      throw new NotFoundError(
        "PARCEIRO_NAO_ENCONTRADO",
        "Parceiro não encontrado.",
      );
    }

    return parceiro;
  },

  async validarCnpjUnico(cnpj: string, parceiroId?: string) {
    const existente = await parceiroRepository.buscarPorCnpj(
      normalizarCnpj(cnpj),
    );

    if (existente && existente.id !== parceiroId) {
      throw new ConflictError(
        "CNPJ_DUPLICADO",
        "Ja existe um parceiro cadastrado com este CNPJ.",
        { cnpj: "Ja existe um parceiro cadastrado com este CNPJ." },
      );
    }
  },

  async criar(dados: ParceiroInput | Prisma.ParceiroUncheckedCreateInput) {
    await this.validarCnpjUnico(dados.cnpj);

    return parceiroRepository.criar({
      ...dados,
      cnpj: normalizarCnpj(dados.cnpj),
    });
  },

  async atualizar(
    id: string,
    dados: ParceiroUpdate | Prisma.ParceiroUncheckedUpdateInput,
  ) {
    await this.buscarPorId(id);

    if (typeof dados.cnpj === "string") {
      await this.validarCnpjUnico(dados.cnpj, id);
    }

    return parceiroRepository.atualizar(id, {
      ...dados,
      ...(typeof dados.cnpj === "string"
        ? { cnpj: normalizarCnpj(dados.cnpj) }
        : {}),
    });
  },

  async listarTodos() {
    return this.listar();
  },

  async ativar(id: string) {
    await this.buscarPorId(id);
    return parceiroRepository.ativar(id);
  },

  async desativar(id: string) {
    await this.buscarPorId(id);
    return parceiroRepository.desativar(id);
  },

  async excluir(id: string) {
    await this.buscarPorId(id);
    const totalAtendimentos =
      await parceiroRepository.contarAtendimentosVinculados(id);

    if (totalAtendimentos > 0) {
      throw new ConflictError(
        "EM_USO",
        "Parceiro possui atendimentos vinculados e não pode ser excluído.",
      );
    }

    return parceiroRepository.excluir(id);
  },

  async deletar(id: string) {
    return this.excluir(id);
  },
};
