import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { fail } from "@/lib/api-response";
import { criarSessao } from "@/lib/auth";
import { verificarRateLimit } from "@/lib/rate-limit";
import { loginInputSchema } from "@/schemas/auth";
import { usuarioService } from "@/services/usuarioService";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const limite = verificarRateLimit(`login:${ip}`);

  if (!limite.permitido) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RATE_LIMIT",
          message: "Muitas tentativas de login. Tente novamente em instantes.",
        },
      },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const input = loginInputSchema.parse(body);

    const usuario = await usuarioService.autenticar(input.email, input.senha);
    const { token, cookieOptions } = await criarSessao(usuario);

    const resposta = NextResponse.json({
      success: true,
      data: {
        autenticado: true,
        usuario,
      },
    });

    resposta.cookies.set("token", token, cookieOptions);

    return resposta;
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE() {
  const resposta = NextResponse.json({
    success: true,
    data: { logout: true },
  });

  resposta.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return resposta;
}
