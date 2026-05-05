import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import type { PerfilUsuario } from "@prisma/client";

type TokenPayload = {
  id: string;
  email: string;
  perfil: PerfilUsuario;
};

export type Session = TokenPayload & {
  iat: number;
  exp: number;
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
