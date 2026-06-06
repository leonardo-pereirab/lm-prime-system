import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "@/domain/errors";
import { hashSenha, verificarSenha } from "@/lib/auth";
import { usuarioRepository } from "@/repositories/usuarioRepository";
import { usuarioService } from "@/services/usuarioService";

vi.mock("@/lib/auth", () => ({
  hashSenha: vi.fn(),
  verificarSenha: vi.fn(),
}));

vi.mock("@/repositories/usuarioRepository", () => ({
  usuarioRepository: {
    listar: vi.fn(),
    buscarPorId: vi.fn(),
    buscarComSenhaPorEmail: vi.fn(),
    criar: vi.fn(),
    atualizar: vi.fn(),
    desativar: vi.fn(),
    contarVinculos: vi.fn(),
    excluir: vi.fn(),
  },
}));

const repo = vi.mocked(usuarioRepository);
const auth = {
  hashSenha: vi.mocked(hashSenha),
  verificarSenha: vi.mocked(verificarSenha),
};

function usuarioAutenticavel(overrides = {}) {
  return {
    id: "usuario-1",
    email: "user@example.com",
    senha: "hash",
    perfil: "ATENDENTE",
    ativo: true,
    funcionario: { estado: "ATIVO" },
    ...overrides,
  };
}

describe("usuarioService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("falha ao buscar usuario inexistente", async () => {
    repo.buscarPorId.mockResolvedValueOnce(null);

    await expect(
      usuarioService.buscarPorId("usuario-1"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("autentica usuario ativo vinculado a funcionario ativo", async () => {
    repo.buscarComSenhaPorEmail.mockResolvedValueOnce(
      usuarioAutenticavel() as never,
    );
    auth.verificarSenha.mockResolvedValueOnce(true);

    await expect(
      usuarioService.autenticar("user@example.com", "senha"),
    ).resolves.toEqual({
      id: "usuario-1",
      email: "user@example.com",
      perfil: "ATENDENTE",
    });
  });

  it("rejeita credenciais inexistentes ou senha invalida", async () => {
    repo.buscarComSenhaPorEmail.mockResolvedValueOnce(null);
    await expect(
      usuarioService.autenticar("user@example.com", "senha"),
    ).rejects.toBeInstanceOf(UnauthorizedError);

    repo.buscarComSenhaPorEmail.mockResolvedValueOnce(
      usuarioAutenticavel() as never,
    );
    auth.verificarSenha.mockResolvedValueOnce(false);
    await expect(
      usuarioService.autenticar("user@example.com", "senha"),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("rejeita usuario inativo ou sem funcionario ativo", async () => {
    repo.buscarComSenhaPorEmail.mockResolvedValueOnce(
      usuarioAutenticavel({ ativo: false }) as never,
    );
    await expect(
      usuarioService.autenticar("user@example.com", "senha"),
    ).rejects.toBeInstanceOf(UnauthorizedError);

    repo.buscarComSenhaPorEmail.mockResolvedValueOnce(
      usuarioAutenticavel({ funcionario: { estado: "INATIVO" } }) as never,
    );
    auth.verificarSenha.mockResolvedValueOnce(true);
    await expect(
      usuarioService.autenticar("user@example.com", "senha"),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("cria e atualiza usuario com senha hasheada", async () => {
    auth.hashSenha.mockResolvedValue("senha-hash");
    repo.buscarPorId.mockResolvedValueOnce({ id: "usuario-1" } as never);

    await usuarioService.criar({
      nome: "Usuario",
      email: "user@example.com",
      senha: "senha123",
      perfil: "ATENDENTE",
    });
    await usuarioService.atualizar("usuario-1", { senha: "nova123" });

    expect(repo.criar).toHaveBeenCalledWith(
      expect.objectContaining({ senha: "senha-hash" }),
    );
    expect(repo.atualizar).toHaveBeenCalledWith(
      "usuario-1",
      expect.objectContaining({ senha: "senha-hash" }),
    );
  });

  it("bloqueia exclusao de usuario com vinculos", async () => {
    repo.buscarPorId.mockResolvedValueOnce({ id: "usuario-1" } as never);
    repo.contarVinculos.mockResolvedValueOnce(1);

    await expect(usuarioService.excluir("usuario-1")).rejects.toBeInstanceOf(
      ConflictError,
    );
    expect(repo.excluir).not.toHaveBeenCalled();
  });
});
