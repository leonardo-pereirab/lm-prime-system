import { beforeEach, describe, expect, it, vi } from "vitest";

import { ConflictError, NotFoundError } from "@/domain/errors";
import { veiculoRepository } from "@/repositories/veiculoRepository";
import { veiculoService } from "@/services/veiculoService";

vi.mock("@/repositories/veiculoRepository", () => ({
  veiculoRepository: {
    listar: vi.fn(),
    contar: vi.fn(),
    buscarPorId: vi.fn(),
    buscarPorPlaca: vi.fn(),
    criar: vi.fn(),
    atualizar: vi.fn(),
    ativar: vi.fn(),
    desativar: vi.fn(),
    contarAtendimentosVinculados: vi.fn(),
    excluir: vi.fn(),
  },
}));

const repo = vi.mocked(veiculoRepository);

describe("veiculoService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lista veiculos paginados com total de paginas", async () => {
    repo.listar.mockResolvedValueOnce([{ id: "veiculo-1" }] as never);
    repo.contar.mockResolvedValueOnce(21);

    const resultado = await veiculoService.listarPaginado({
      pagina: 2,
      tamanho: 10,
      busca: "van",
    });

    expect(repo.listar).toHaveBeenCalledWith({
      pagina: 2,
      tamanho: 10,
      busca: "van",
    });
    expect(repo.contar).toHaveBeenCalledWith({ busca: "van" });
    expect(resultado).toMatchObject({
      total: 21,
      pagina: 2,
      tamanho: 10,
      totalPaginas: 3,
    });
  });

  it("falha ao buscar veiculo inexistente", async () => {
    repo.buscarPorId.mockResolvedValueOnce(null);

    await expect(
      veiculoService.buscarPorId("veiculo-1"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("normaliza placa ao criar veiculo", async () => {
    repo.buscarPorPlaca.mockResolvedValueOnce(null);
    repo.criar.mockResolvedValueOnce({ id: "veiculo-1" } as never);

    await veiculoService.criar({
      placa: " abc1d23 ",
      modelo: "Sprinter",
      marca: "Mercedes",
      ano: 2024,
      capacidade: 15,
      tipo: "VAN",
    });

    expect(repo.buscarPorPlaca).toHaveBeenCalledWith("ABC1D23");
    expect(repo.criar).toHaveBeenCalledWith(
      expect.objectContaining({ placa: "ABC1D23" }),
    );
  });

  it("bloqueia placa duplicada em outro veiculo", async () => {
    repo.buscarPorPlaca.mockResolvedValueOnce({ id: "outro" } as never);

    await expect(
      veiculoService.validarPlacaUnica("abc1d23", "veiculo-1"),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("bloqueia exclusao quando ha atendimentos vinculados", async () => {
    repo.buscarPorId.mockResolvedValueOnce({ id: "veiculo-1" } as never);
    repo.contarAtendimentosVinculados.mockResolvedValueOnce(1);

    await expect(veiculoService.excluir("veiculo-1")).rejects.toBeInstanceOf(
      ConflictError,
    );
    expect(repo.excluir).not.toHaveBeenCalled();
  });
});
