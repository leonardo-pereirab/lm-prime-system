import { ConflictError, NotFoundError } from "@/domain/errors";
import { clienteRepository } from "@/repositories/clienteRepository";
import type { ClienteFiltros } from "@/repositories/clienteRepository";
import type { ClienteInput, ClienteUpdate } from "@/schemas/cliente";
import type { Prisma } from "@prisma/client";

export const clienteService = {
  async listar(filtros: ClienteFiltros = {}) {
    return clienteRepository.listar(filtros);
  },

  async listarPaginado(filtros: ClienteFiltros = {}) {
    const { pagina = 1, tamanho = 20, ...restante } = filtros;

    const [itens, total] = await Promise.all([
      clienteRepository.listar({ ...restante, pagina, tamanho }),
      clienteRepository.contar(restante),
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
    const cliente = await clienteRepository.buscarPorId(id);
    if (!cliente) {
      throw new NotFoundError(
        "CLIENTE_NAO_ENCONTRADO",
        "Cliente não encontrado.",
      );
    }

    return cliente;
  },

  async criar(dados: ClienteInput | Prisma.ClienteUncheckedCreateInput) {
    return clienteRepository.criar(dados);
  },

  async atualizar(
    id: string,
    dados: ClienteUpdate | Prisma.ClienteUncheckedUpdateInput,
  ) {
    await this.buscarPorId(id);
    return clienteRepository.atualizar(id, dados);
  },

  async listarTodos() {
    return this.listar();
  },

  async desativar(id: string) {
    await this.buscarPorId(id);
    return clienteRepository.desativar(id);
  },

  async ativar(id: string) {
    await this.buscarPorId(id);
    return clienteRepository.ativar(id);
  },

  async excluir(id: string) {
    await this.buscarPorId(id);
    const totalAtendimentos = await clienteRepository.contarAtendimentos(id);

    if (totalAtendimentos > 0) {
      throw new ConflictError(
        "EM_USO",
        "Cliente possui atendimentos vinculados e não pode ser excluído.",
      );
    }

    return clienteRepository.excluir(id);
  },

  async deletar(id: string) {
    return this.excluir(id);
  },

  async listarAtendimentosResumo(clienteId: string, limite = 10) {
    await this.buscarPorId(clienteId);
    return clienteRepository.listarAtendimentosResumo(clienteId, limite);
  },
};
