import { describe, expect, it, beforeEach, vi } from "vitest";
import { ConflictError } from "@/domain/errors";

vi.mock("@/lib/auth", () => ({
  hashSenha: vi.fn(),
}));

vi.mock("@/repositories/usuarioRepository", () => ({
  usuarioRepository: {
    listar: vi.fn(),
    buscarPorId: vi.fn(),
    criar: vi.fn(),
    atualizar: vi.fn(),
    desativar: vi.fn(),
    excluir: vi.fn(),
    contarVinculos: vi.fn(),
  },
}));

import { hashSenha } from "@/lib/auth";
import { usuarioRepository } from "@/repositories/usuarioRepository";
import { usuarioService } from "@/services/usuarioService";

describe("usuarioService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve aplicar hash da senha ao criar usuario", async () => {
    vi.mocked(hashSenha).mockResolvedValueOnce("hash-gerado");
    vi.mocked(usuarioRepository.criar).mockResolvedValueOnce({
      id: "usr-1",
      email: "usuario@teste.com",
    } as never);

    await usuarioService.criar({
      nome: "Usuário Teste",
      email: "usuario@teste.com",
      senha: "senha123",
      perfil: "ADMIN",
    });

    expect(hashSenha).toHaveBeenCalledWith("senha123");
    expect(usuarioRepository.criar).toHaveBeenCalledWith(
      expect.objectContaining({ senha: "hash-gerado" }),
    );
  });

  it("deve aplicar hash da senha ao atualizar quando senha for enviada", async () => {
    vi.mocked(usuarioRepository.buscarPorId).mockResolvedValueOnce({
      id: "usr-1",
      nome: "Usuário Teste",
      email: "usuario@teste.com",
    } as never);
    vi.mocked(hashSenha).mockResolvedValueOnce("novo-hash");
    vi.mocked(usuarioRepository.atualizar).mockResolvedValueOnce({
      id: "usr-1",
      email: "usuario@teste.com",
    } as never);

    await usuarioService.atualizar("usr-1", { senha: "novaSenha123" });

    expect(hashSenha).toHaveBeenCalledWith("novaSenha123");
    expect(usuarioRepository.atualizar).toHaveBeenCalledWith(
      "usr-1",
      expect.objectContaining({ senha: "novo-hash" }),
    );
  });

  it("deve bloquear exclusao de usuario com vinculos", async () => {
    vi.mocked(usuarioRepository.buscarPorId).mockResolvedValueOnce({
      id: "usr-1",
      nome: "Usuário Teste",
      email: "usuario@teste.com",
    } as never);
    vi.mocked(usuarioRepository.contarVinculos).mockResolvedValueOnce(1);

    await expect(usuarioService.excluir("usr-1")).rejects.toBeInstanceOf(
      ConflictError,
    );

    expect(usuarioRepository.excluir).not.toHaveBeenCalled();
  });
});
