import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/domain/errors";
import { hashSenha } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { funcionarioRepository } from "@/repositories/funcionarioRepository";
import { funcionarioService } from "@/services/funcionarioService";

vi.mock("@/lib/auth", () => ({
  hashSenha: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
  },
}));

vi.mock("@/repositories/funcionarioRepository", () => ({
  funcionarioRepository: {
    listar: vi.fn(),
    contar: vi.fn(),
    buscarPorId: vi.fn(),
    criar: vi.fn(),
    atualizar: vi.fn(),
    buscarConvidadoPorEmailEMatricula: vi.fn(),
    excluir: vi.fn(),
  },
}));

const repo = vi.mocked(funcionarioRepository);
const prismaMock = vi.mocked(prisma);
const transaction = prismaMock.$transaction as unknown as ReturnType<
  typeof vi.fn
>;
const auth = {
  hashSenha: vi.mocked(hashSenha),
};

const tx = {
  usuario: {
    create: vi.fn(),
    update: vi.fn(),
  },
  funcionario: {
    update: vi.fn(),
  },
};

const funcionarioInput = {
  nomeCompleto: "Ana Atendente",
  emailCorporativo: "ana@lmprime.com",
  cpf: "529.982.247-25",
  telefonePrincipal: "(11) 98765-4321",
  classificacao: "ATENDENTE" as const,
  cep: "12345-678",
  logradouro: "Rua Central",
  numero: "100",
  bairro: "Centro",
  cidade: "Sao Paulo",
  estadoUf: "sp",
};

function funcionario(overrides = {}) {
  return {
    id: "func-1",
    matricula: "FUN-00001",
    nomeCompleto: "Ana Atendente",
    emailCorporativo: "ana@lmprime.com",
    cpf: "52998224725",
    telefonePrincipal: "11987654321",
    cep: "12345678",
    logradouro: "Rua Central",
    numero: "100",
    complemento: null,
    bairro: "Centro",
    cidade: "Sao Paulo",
    estadoUf: "SP",
    classificacao: "ATENDENTE",
    estado: "CONVIDADO",
    usuarioId: null,
    anonimizadoEm: null,
    ...overrides,
  };
}

describe("funcionarioService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transaction.mockImplementation(
      async (callback: (transaction: typeof tx) => unknown) => callback(tx),
    );
  });

  it("lista funcionarios paginados com ordenacao", async () => {
    repo.listar.mockResolvedValueOnce([{ id: "func-1" }] as never);
    repo.contar.mockResolvedValueOnce(22);

    const resultado = await funcionarioService.listarPaginado(
      { pagina: 2, tamanho: 10, busca: "ana" },
      "NOME_DESC",
    );

    expect(repo.listar).toHaveBeenCalledWith(
      { pagina: 2, tamanho: 10, busca: "ana" },
      "NOME_DESC",
    );
    expect(repo.contar).toHaveBeenCalledWith({ busca: "ana" });
    expect(resultado.totalPaginas).toBe(3);
  });

  it("falha ao buscar funcionario inexistente", async () => {
    repo.buscarPorId.mockResolvedValueOnce(null);

    await expect(
      funcionarioService.buscarPorId("func-1"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("cria convidado normalizando cpf, telefone, cep, uf e matricula", async () => {
    repo.contar.mockResolvedValueOnce(0);
    repo.criar.mockResolvedValueOnce({ id: "func-1" } as never);

    await funcionarioService.criarConvidado(funcionarioInput);

    expect(repo.criar).toHaveBeenCalledWith(
      expect.objectContaining({
        estado: "CONVIDADO",
        matricula: "FUN-00001",
        cpf: "52998224725",
        telefonePrincipal: "11987654321",
        cep: "12345678",
        estadoUf: "SP",
      }),
    );
  });

  it("bloqueia criacao com cpf invalido", async () => {
    await expect(
      funcionarioService.criarConvidado({ ...funcionarioInput, cpf: "123" }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("valida ativacao de convidado", async () => {
    repo.buscarConvidadoPorEmailEMatricula.mockResolvedValueOnce(
      funcionario() as never,
    );

    const resultado = await funcionarioService.validarAtivacao(
      "ana@lmprime.com",
      "FUN-00001",
    );

    expect(resultado).toMatchObject({
      id: "func-1",
      matricula: "FUN-00001",
      emailCorporativo: "ana@lmprime.com",
    });
  });

  it("rejeita ativacao com dados nao reconhecidos", async () => {
    repo.buscarConvidadoPorEmailEMatricula.mockResolvedValueOnce(null);

    await expect(
      funcionarioService.validarAtivacao("ana@lmprime.com", "FUN-00001"),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("conclui primeiro acesso criando usuario e ativando funcionario", async () => {
    repo.buscarConvidadoPorEmailEMatricula.mockResolvedValueOnce(
      funcionario({ classificacao: "GERENTE" }) as never,
    );
    auth.hashSenha.mockResolvedValueOnce("senha-hash");
    tx.usuario.create.mockResolvedValueOnce({ id: "usuario-1" });
    tx.funcionario.update.mockResolvedValueOnce({
      id: "func-1",
      estado: "ATIVO",
    });

    await funcionarioService.concluirPrimeiroAcesso({
      email: "ana@lmprime.com",
      matricula: "FUN-00001",
      senha: "senha123",
      confirmarSenha: "senha123",
      aceitouTermos: true,
      versaoTermosAceita: "v1",
      telefoneAdicional: "1133334444",
    });

    expect(tx.usuario.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        senha: "senha-hash",
        perfil: "ADMIN",
      }),
    });
    expect(tx.funcionario.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          usuarioId: "usuario-1",
          estado: "ATIVO",
          telefoneAdicional: "1133334444",
          versaoTermosAceita: "v1",
        }),
      }),
    );
  });

  it("bloqueia ativacao de funcionario sem usuario vinculado", async () => {
    repo.buscarPorId.mockResolvedValueOnce(funcionario() as never);

    await expect(funcionarioService.ativar("func-1")).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it("exclui convidado sem usuario e anonimiza funcionario ativo", async () => {
    repo.buscarPorId.mockResolvedValueOnce(funcionario() as never);

    await expect(
      funcionarioService.excluirOuAnonimizar("func-1"),
    ).resolves.toEqual({
      modo: "EXCLUIDO",
    });
    expect(repo.excluir).toHaveBeenCalledWith("func-1");

    repo.buscarPorId.mockResolvedValueOnce(
      funcionario({ estado: "ATIVO", usuarioId: "usuario-1" }) as never,
    );

    await expect(
      funcionarioService.excluirOuAnonimizar("func-1"),
    ).resolves.toEqual({
      modo: "ANONIMIZADO",
    });
    expect(tx.usuario.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "usuario-1" },
        data: expect.objectContaining({ ativo: false }),
      }),
    );
    expect(tx.funcionario.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "func-1" },
        data: expect.objectContaining({
          estado: "INATIVO",
          telefonePrincipal: "0000000000",
          anonimizadoEm: expect.any(Date),
        }),
      }),
    );
  });

  it("bloqueia atualizacao critica de funcionario anonimizado", async () => {
    repo.buscarPorId.mockResolvedValueOnce(
      funcionario({ anonimizadoEm: new Date() }) as never,
    );

    await expect(
      funcionarioService.atualizarDadosCriticos("func-1", {
        nomeCompleto: "Novo",
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});
