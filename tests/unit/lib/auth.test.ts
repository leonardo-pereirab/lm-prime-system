import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  class SignJWTMock {
    payload: unknown;

    constructor(payload: unknown) {
      this.payload = payload;
    }

    setProtectedHeader = vi.fn(() => this);
    setExpirationTime = vi.fn(() => this);
    sign = vi.fn(async () => "token-assinado");
  }

  return {
    SignJWTMock,
    jwtVerify: vi.fn(),
    hash: vi.fn(),
    compare: vi.fn(),
  };
});

vi.mock("jose", () => ({
  SignJWT: mocks.SignJWTMock,
  jwtVerify: mocks.jwtVerify,
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: mocks.hash,
    compare: mocks.compare,
  },
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

describe("auth helpers", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.clearAllMocks();
    vi.stubEnv("JWT_SECRET", "segredo-de-teste");
    vi.stubEnv("JWT_EXPIRES_IN", "1h");
    mocks.jwtVerify.mockResolvedValue({
      payload: {
        id: "usuario-1",
        email: "user@example.com",
        perfil: "ADMIN",
        iat: 1,
        exp: 2,
      },
    });
    mocks.hash.mockResolvedValue("senha-hash");
    mocks.compare.mockResolvedValue(true);
  });

  it("gera e verifica token de sessao", async () => {
    const { gerarToken, verificarToken } = await import("@/lib/auth");

    const token = await gerarToken({
      id: "usuario-1",
      email: "user@example.com",
      perfil: "ADMIN",
    });
    const sessao = await verificarToken(token);

    expect(sessao).toMatchObject({
      id: "usuario-1",
      email: "user@example.com",
      perfil: "ADMIN",
    });
    expect(token).toBe("token-assinado");
    expect(sessao.exp).toBeGreaterThan(sessao.iat);
  });

  it("gera hash e verifica senha", async () => {
    const { hashSenha, verificarSenha } = await import("@/lib/auth");

    const hash = await hashSenha("senha123");

    expect(hash).toBe("senha-hash");
    expect(mocks.hash).toHaveBeenCalledWith("senha123", 10);
    await expect(verificarSenha("senha123", hash)).resolves.toBe(true);
    mocks.compare.mockResolvedValueOnce(false);
    await expect(verificarSenha("outra", hash)).resolves.toBe(false);
  });

  it("extrai sessao de request e retorna null sem token ou com token invalido", async () => {
    const { gerarToken, getSessionFromRequest } = await import("@/lib/auth");
    const token = await gerarToken({
      id: "usuario-1",
      email: "user@example.com",
      perfil: "ATENDENTE",
    });

    const requestComToken = {
      cookies: {
        get: vi.fn().mockReturnValue({ value: token }),
      },
    };
    const requestSemToken = {
      cookies: {
        get: vi.fn().mockReturnValue(undefined),
      },
    };
    const requestTokenInvalido = {
      cookies: {
        get: vi.fn().mockReturnValue({ value: "token-invalido" }),
      },
    };

    await expect(
      getSessionFromRequest(requestComToken as never),
    ).resolves.toMatchObject({
      id: "usuario-1",
    });
    await expect(
      getSessionFromRequest(requestSemToken as never),
    ).resolves.toBeNull();
    mocks.jwtVerify.mockRejectedValueOnce(new Error("token invalido"));
    await expect(
      getSessionFromRequest(requestTokenInvalido as never),
    ).resolves.toBeNull();
  });

  it("exige sessao via request e rejeita token ausente ou invalido", async () => {
    const { gerarToken, requireSession } = await import("@/lib/auth");
    const token = await gerarToken({
      id: "usuario-1",
      email: "user@example.com",
      perfil: "ADMIN",
    });

    await expect(
      requireSession({
        cookies: { get: vi.fn().mockReturnValue({ value: token }) },
      } as never),
    ).resolves.toMatchObject({ id: "usuario-1" });
    await expect(
      requireSession({
        cookies: { get: vi.fn().mockReturnValue(undefined) },
      } as never),
    ).rejects.toMatchObject({ code: "SESSAO_AUSENTE" });
    mocks.jwtVerify.mockRejectedValueOnce(new Error("token invalido"));
    await expect(
      requireSession({
        cookies: { get: vi.fn().mockReturnValue({ value: "invalido" }) },
      } as never),
    ).rejects.toMatchObject({ code: "SESSAO_INVALIDA" });
  });

  it("exige perfil autorizado", async () => {
    const { requirePerfil } = await import("@/lib/auth");

    expect(() =>
      requirePerfil(
        {
          id: "usuario-1",
          email: "user@example.com",
          perfil: "ADMIN",
          iat: 1,
          exp: 2,
        },
        "ADMIN",
      ),
    ).not.toThrow();
    expect(() =>
      requirePerfil(
        {
          id: "usuario-1",
          email: "user@example.com",
          perfil: "ATENDENTE",
          iat: 1,
          exp: 2,
        },
        "ADMIN",
      ),
    ).toThrowError(
      expect.objectContaining({ code: "PERMISSAO_NEGADA" }) as Error,
    );
  });

  it("cria sessao com cookie seguro apenas em producao", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const { criarSessao } = await import("@/lib/auth");

    const sessao = await criarSessao({
      id: "usuario-1",
      email: "user@example.com",
      perfil: "ADMIN",
    });

    expect(sessao.token).toEqual(expect.any(String));
    expect(sessao.cookieOptions).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  });
});
