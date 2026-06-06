import { beforeEach, describe, expect, it, vi } from "vitest";

import { ConflictError, NotFoundError } from "@/domain/errors";
import { clienteRepository } from "@/repositories/clienteRepository";
import { clienteService } from "@/services/clienteService";

vi.mock("@/repositories/clienteRepository", () => ({
  clienteRepository: {
    listar: vi.fn(),
    contar: vi.fn(),
    buscarPorId: vi.fn(),
    criar: vi.fn(),
    atualizar: vi.fn(),
    ativar: vi.fn(),
    desativar: vi.fn(),
    contarAtendimentos: vi.fn(),
    excluir: vi.fn(),
    listarAtendimentosResumo: vi.fn(),
  },
}));

const repo = vi.mocked(clienteRepository);

describe("clienteService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lista clientes paginados com total de paginas", async () => {
    repo.listar.mockResolvedValueOnce([{ id: "cliente-1" }] as never);
    repo.contar.mockResolvedValueOnce(0);

    const resultado = await clienteService.listarPaginado({
      pagina: 1,
      tamanho: 20,
      busca: "maria",
    });

    expect(repo.listar).toHaveBeenCalledWith({
      pagina: 1,
      tamanho: 20,
      busca: "maria",
    });
    expect(repo.contar).toHaveBeenCalledWith({ busca: "maria" });
    expect(resultado.totalPaginas).toBe(1);
  });

  it("falha ao buscar cliente inexistente", async () => {
    repo.buscarPorId.mockResolvedValueOnce(null);

    await expect(
      clienteService.buscarPorId("cliente-1"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("bloqueia atualizacao de cliente anonimizado", async () => {
    repo.buscarPorId.mockResolvedValueOnce({
      id: "cliente-1",
      anonimizadoEm: new Date(),
    } as never);

    await expect(
      clienteService.atualizar("cliente-1", { nome: "Novo nome" }),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(repo.atualizar).not.toHaveBeenCalled();
  });

  it("exclui cliente sem atendimentos vinculados", async () => {
    repo.buscarPorId.mockResolvedValueOnce({
      id: "cliente-1",
      cpfCnpj: "52998224725",
    } as never);
    repo.contarAtendimentos.mockResolvedValueOnce(0);

    await expect(clienteService.excluir("cliente-1")).resolves.toEqual({
      modo: "EXCLUIDO",
    });
    expect(repo.excluir).toHaveBeenCalledWith("cliente-1");
  });

  it("anonimiza cliente com atendimentos vinculados", async () => {
    repo.buscarPorId.mockResolvedValueOnce({
      id: "cliente-123456",
      cpfCnpj: "52998224725",
    } as never);
    repo.contarAtendimentos.mockResolvedValueOnce(3);

    await expect(clienteService.excluir("cliente-123456")).resolves.toEqual({
      modo: "ANONIMIZADO",
    });
    expect(repo.atualizar).toHaveBeenCalledWith(
      "cliente-123456",
      expect.objectContaining({
        nome: "Cliente removido 123456",
        telefone: "0000000000",
        ativo: false,
        anonimizadoEm: expect.any(Date),
      }),
    );
  });

  it("lista resumo de atendimentos apos confirmar existencia do cliente", async () => {
    repo.buscarPorId.mockResolvedValueOnce({ id: "cliente-1" } as never);
    repo.listarAtendimentosResumo.mockResolvedValueOnce([
      { id: "atd-1" },
    ] as never);

    await clienteService.listarAtendimentosResumo("cliente-1", 5);

    expect(repo.listarAtendimentosResumo).toHaveBeenCalledWith("cliente-1", 5);
  });
});
