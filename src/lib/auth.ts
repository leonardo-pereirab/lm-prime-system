import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import type { PerfilUsuario } from "@prisma/client";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { ForbiddenError, UnauthorizedError } from "@/domain/errors";

type TokenPayload = {
  id: string;
  email: string;
  perfil: PerfilUsuario;
};

type UsuarioSessaoInput = {
  id: string;
  email: string;
  perfil: PerfilUsuario;
};

export type Session = TokenPayload & {
  iat: number;
  exp: number;
};

type SessaoCookieOptions = {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: "/";
  maxAge: number;
};

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "chave-secreta-desenvolvimento",
);

export async function gerarToken(payload: TokenPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(process.env.JWT_EXPIRES_IN ?? "7d")
    .sign(secret);
}

export async function verificarToken(token: string): Promise<Session> {
  const { payload } = await jwtVerify(token, secret);
  return payload as Session;
}

export async function hashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, 10);
}

export async function verificarSenha(
  senha: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}

export async function getSessionFromRequest(
  request: NextRequest,
): Promise<Session | null> {
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return null;
  }

  try {
    return await verificarToken(token);
  } catch {
    return null;
  }
}

export async function requireSession(request?: NextRequest): Promise<Session> {
  const token = request
    ? request.cookies.get("token")?.value
    : (await cookies()).get("token")?.value;

  if (!token) {
    throw new UnauthorizedError(
      "SESSAO_AUSENTE",
      "Sessão inválida ou expirada.",
    );
  }

  try {
    return await verificarToken(token);
  } catch {
    throw new UnauthorizedError(
      "SESSAO_INVALIDA",
      "Sessão inválida ou expirada.",
    );
  }
}

export function requirePerfil(
  session: Session,
  ...perfis: PerfilUsuario[]
): void {
  if (!perfis.includes(session.perfil)) {
    throw new ForbiddenError(
      "PERMISSAO_NEGADA",
      "Sem permissão para esta operação.",
    );
  }
}

export async function criarSessao(usuario: UsuarioSessaoInput): Promise<{
  token: string;
  cookieOptions: SessaoCookieOptions;
}> {
  const token = await gerarToken({
    id: usuario.id,
    email: usuario.email,
    perfil: usuario.perfil,
  });

  return {
    token,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    },
  };
}
