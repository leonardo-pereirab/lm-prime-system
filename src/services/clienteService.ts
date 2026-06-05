import { ConflictError, NotFoundError } from "@/domain/errors";
import { clienteRepository } from "@/repositories/clienteRepository";
import type { ClienteFiltros } from "@/repositories/clienteRepository";
import type { ClienteInput, ClienteUpdate } from "@/schemas/cliente";
import type { Prisma } from "@prisma/client";

function gerarDocumentoAnonimizado(base: string, tamanho: 11 | 14): string {
  const seed = [...base].reduce((acc, char) => {
    return (acc * 31 + char.charCodeAt(0)) % 10 ** Math.min(tamanho, 9);
  }, 7);

  return String(10 ** tamanho + seed).slice(-tamanho);
}

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
    const cliente = await this.buscarPorId(id);

    if (cliente.anonimizadoEm) {
      throw new ConflictError(
        "CLIENTE_ANONIMIZADO",
        "Cliente anonimizado nao pode ter dados criticos alterados.",
      );
    }

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
    const cliente = await this.buscarPorId(id);
    const totalAtendimentos = await clienteRepository.contarAtendimentos(id);

    if (totalAtendimentos === 0) {
      await clienteRepository.excluir(id);
      return { modo: "EXCLUIDO" as const };
    }

    const tamanhoDocumento = cliente.cpfCnpj.length > 11 ? 14 : 11;
    const cpfCnpjAnonimizado = gerarDocumentoAnonimizado(id, tamanhoDocumento);
    const emailAnonimo = `anonimo+${id}@anonimo.local`;

    await clienteRepository.atualizar(id, {
      nome: `Cliente removido ${id.slice(-6)}`,
      cpfCnpj: cpfCnpjAnonimizado,
      rgIe: null,
      telefone: "0000000000",
      telefoneSec: null,
      email: emailAnonimo,
      cep: null,
      logradouro: null,
      numero: null,
      complemento: null,
      bairro: null,
      cidade: null,
      estado: null,
      ativo: false,
      observacoes: "Cadastro anonimizado por possuir atendimentos vinculados.",
      anonimizadoEm: new Date(),
    });

    return { modo: "ANONIMIZADO" as const };
  },

  async deletar(id: string) {
    return this.excluir(id);
  },

  async listarAtendimentosResumo(clienteId: string, limite = 10) {
    await this.buscarPorId(clienteId);
    return clienteRepository.listarAtendimentosResumo(clienteId, limite);
  },
};
