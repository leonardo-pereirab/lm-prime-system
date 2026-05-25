import { describe, expect, it, beforeEach, vi } from "vitest";
import { ConflictError, NotFoundError } from "@/domain/errors";

vi.mock("@/repositories/clienteRepository", () => ({
  clienteRepository: {
    listar: vi.fn(),
    buscarPorId: vi.fn(),
    criar: vi.fn(),
    atualizar: vi.fn(),
    desativar: vi.fn(),
    excluir: vi.fn(),
    contarAtendimentos: vi.fn(),
  },
}));

import { clienteRepository } from "@/repositories/clienteRepository";
import { clienteService } from "@/services/clienteService";

describe("clienteService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve desativar cliente existente", async () => {
    vi.mocked(clienteRepository.buscarPorId).mockResolvedValueOnce({
      id: "cli-1",
      nome: "Cliente Teste",
    } as never);
    vi.mocked(clienteRepository.desativar).mockResolvedValueOnce({
      id: "cli-1",
      ativo: false,
    } as never);

    const resultado = await clienteService.desativar("cli-1");

    expect(resultado).toMatchObject({ id: "cli-1", ativo: false });
    expect(clienteRepository.desativar).toHaveBeenCalledWith("cli-1");
  });

  it("deve bloquear exclusao quando cliente possui atendimentos vinculados", async () => {
    vi.mocked(clienteRepository.buscarPorId).mockResolvedValueOnce({
      id: "cli-1",
      nome: "Cliente Teste",
    } as never);
    vi.mocked(clienteRepository.contarAtendimentos).mockResolvedValueOnce(2);

    await expect(clienteService.excluir("cli-1")).rejects.toBeInstanceOf(
      ConflictError,
    );

    expect(clienteRepository.excluir).not.toHaveBeenCalled();
  });

  it("deve excluir cliente sem atendimentos vinculados", async () => {
    vi.mocked(clienteRepository.buscarPorId).mockResolvedValueOnce({
      id: "cli-1",
      nome: "Cliente Teste",
    } as never);
    vi.mocked(clienteRepository.contarAtendimentos).mockResolvedValueOnce(0);
    vi.mocked(clienteRepository.excluir).mockResolvedValueOnce({
      id: "cli-1",
    } as never);

    await clienteService.excluir("cli-1");

    expect(clienteRepository.excluir).toHaveBeenCalledWith("cli-1");
  });

  it("deve lancar NotFoundError quando cliente nao existir", async () => {
    vi.mocked(clienteRepository.buscarPorId).mockResolvedValueOnce(null);

    await expect(
      clienteService.buscarPorId("inexistente"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
