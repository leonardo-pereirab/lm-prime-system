import type { Page } from "@playwright/test";

import { gerarToken, hashSenha } from "../../../src/lib/auth";
import { prisma } from "../../../src/lib/prisma";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export async function autenticarSessaoE2E(page: Page) {
  const email = process.env.SEED_EMAIL ?? "admin@lmprime.local";
  const senha = process.env.SEED_SENHA ?? "Admin@123";

  let usuario = await prisma.usuario.findUnique({
    where: { email },
    select: { id: true, email: true, perfil: true },
  });

  if (!usuario) {
    const senhaHash = await hashSenha(senha);

    usuario = await prisma.usuario.create({
      data: {
        nome: "Administrador E2E",
        email,
        senha: senhaHash,
        perfil: "ADMIN",
      },
      select: { id: true, email: true, perfil: true },
    });
  }

  const token = await gerarToken({
    id: usuario.id,
    email: usuario.email,
    perfil: usuario.perfil,
  });

  const origem = new URL(baseURL);

  await page.context().addCookies([
    {
      name: "token",
      value: token,
      domain: origem.hostname,
      path: "/",
      httpOnly: true,
      secure: origem.protocol === "https:",
      sameSite: "Lax",
    },
  ]);
}
