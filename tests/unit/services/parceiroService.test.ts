import { beforeEach, describe, expect, it, vi } from "vitest";

import { ConflictError, NotFoundError } from "@/domain/errors";
import { parceiroRepository } from "@/repositories/parceiroRepository";
import { parceiroService } from "@/services/parceiroService";

vi.mock("@/repositories/parceiroRepository", () => ({
  parceiroRepository: {
    listar: vi.fn(),
    contar: vi.fn(),
    buscarPorId: vi.fn(),
    buscarPorCnpj: vi.fn(),
    criar: vi.fn(),
    atualizar: vi.fn(),
    ativar: vi.fn(),
    desativar: vi.fn(),
    contarAtendimentosVinculados: vi.fn(),
    excluir: vi.fn(),
  },
}));

const repo = vi.mocked(parceiroRepository);

describe("parceiroService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lista parceiros paginados com total de paginas", async () => {
    repo.listar.mockResolvedValueOnce([{ id: "parceiro-1" }] as never);
    repo.contar.mockResolvedValueOnce(20);

    const resultado = await parceiroService.listarPaginado({
      pagina: 1,
      tamanho: 8,
      busca: "turismo",
    });

    expect(repo.listar).toHaveBeenCalledWith({
      pagina: 1,
      tamanho: 8,
      busca: "turismo",
    });
    expect(repo.contar).toHaveBeenCalledWith({ busca: "turismo" });
    expect(resultado.totalPaginas).toBe(3);
  });

  it("falha ao buscar parceiro inexistente", async () => {
    repo.buscarPorId.mockResolvedValueOnce(null);

    await expect(
      parceiroService.buscarPorId("parceiro-1"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("normaliza cnpj ao criar parceiro", async () => {
    repo.buscarPorCnpj.mockResolvedValueOnce(null);
    repo.criar.mockResolvedValueOnce({ id: "parceiro-1" } as never);

    await parceiroService.criar({
      nome: "Parceiro Turismo",
      cnpj: " 11222333000181 ",
      telefone: "11987654321",
    });

    expect(repo.buscarPorCnpj).toHaveBeenCalledWith("11222333000181");
    expect(repo.criar).toHaveBeenCalledWith(
      expect.objectContaining({ cnpj: "11222333000181" }),
    );
  });

  it("bloqueia cnpj duplicado em outro parceiro", async () => {
    repo.buscarPorCnpj.mockResolvedValueOnce({ id: "outro" } as never);

    await expect(
      parceiroService.validarCnpjUnico("11222333000181", "parceiro-1"),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("bloqueia exclusao quando ha atendimentos vinculados", async () => {
    repo.buscarPorId.mockResolvedValueOnce({ id: "parceiro-1" } as never);
    repo.contarAtendimentosVinculados.mockResolvedValueOnce(1);

    await expect(parceiroService.excluir("parceiro-1")).rejects.toBeInstanceOf(
      ConflictError,
    );
    expect(repo.excluir).not.toHaveBeenCalled();
  });
});
