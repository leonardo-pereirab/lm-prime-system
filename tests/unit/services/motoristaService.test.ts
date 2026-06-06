import { beforeEach, describe, expect, it, vi } from "vitest";

import { ConflictError, NotFoundError } from "@/domain/errors";
import { motoristaRepository } from "@/repositories/motoristaRepository";
import { motoristaService } from "@/services/motoristaService";

vi.mock("@/repositories/motoristaRepository", () => ({
  motoristaRepository: {
    listar: vi.fn(),
    contar: vi.fn(),
    buscarPorId: vi.fn(),
    criar: vi.fn(),
    atualizar: vi.fn(),
    listarComCnhVencendo: vi.fn(),
    ativar: vi.fn(),
    desativar: vi.fn(),
    contarAtendimentosVinculados: vi.fn(),
    excluir: vi.fn(),
  },
}));

const repo = vi.mocked(motoristaRepository);

describe("motoristaService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lista motoristas paginados com total de paginas", async () => {
    repo.listar.mockResolvedValueOnce([{ id: "motorista-1" }] as never);
    repo.contar.mockResolvedValueOnce(41);

    const resultado = await motoristaService.listarPaginado({
      pagina: 3,
      tamanho: 20,
    });

    expect(resultado).toMatchObject({
      total: 41,
      pagina: 3,
      tamanho: 20,
      totalPaginas: 3,
    });
  });

  it("falha ao buscar motorista inexistente", async () => {
    repo.buscarPorId.mockResolvedValueOnce(null);

    await expect(
      motoristaService.buscarPorId("motorista-1"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("cria motorista delegando ao repositorio", async () => {
    const dados = {
      nome: "Joao Motorista",
      telefone: "11987654321",
      cpf: "52998224725",
      cnh: "123456",
      cnhCategoria: "D" as const,
      cnhValidade: new Date("2027-01-01"),
    };
    repo.criar.mockResolvedValueOnce({ id: "motorista-1" } as never);

    await motoristaService.criar(dados);

    expect(repo.criar).toHaveBeenCalledWith(dados);
  });

  it("atualiza somente depois de confirmar existencia", async () => {
    repo.buscarPorId.mockResolvedValueOnce({ id: "motorista-1" } as never);
    repo.atualizar.mockResolvedValueOnce({ id: "motorista-1" } as never);

    await motoristaService.atualizar("motorista-1", { telefone: "1133334444" });

    expect(repo.buscarPorId).toHaveBeenCalledWith("motorista-1");
    expect(repo.atualizar).toHaveBeenCalledWith("motorista-1", {
      telefone: "1133334444",
    });
  });

  it("bloqueia exclusao quando ha atendimentos vinculados", async () => {
    repo.buscarPorId.mockResolvedValueOnce({ id: "motorista-1" } as never);
    repo.contarAtendimentosVinculados.mockResolvedValueOnce(2);

    await expect(
      motoristaService.excluir("motorista-1"),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(repo.excluir).not.toHaveBeenCalled();
  });
});
