import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { gerarToken, verificarSenha } from "@/lib/auth";

type LoginPayload = {
  email?: string;
  senha?: string;
};

export async function POST(request: NextRequest) {
  try {
    const { email, senha } = (await request.json()) as LoginPayload;

    if (!email || !senha) {
      return NextResponse.json(
        { erro: "E-mail e senha sao obrigatorios." },
        { status: 400 },
      );
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario || !usuario.ativo) {
      return NextResponse.json(
        { erro: "Credenciais invalidas." },
        { status: 401 },
      );
    }

    const senhaValida = await verificarSenha(senha, usuario.senha);
    if (!senhaValida) {
      return NextResponse.json(
        { erro: "Credenciais invalidas." },
        { status: 401 },
      );
    }

    const token = await gerarToken({
      id: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil,
    });

    const resposta = NextResponse.json({
      mensagem: "Login realizado com sucesso.",
    });
    resposta.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return resposta;
  } catch (erro) {
    console.error("[POST /api/auth]", erro);

    if (
      erro instanceof Prisma.PrismaClientInitializationError ||
      erro instanceof Prisma.PrismaClientRustPanicError
    ) {
      return NextResponse.json(
        { erro: "Servico indisponivel. Tente novamente em instantes." },
        { status: 503 },
      );
    }

    if (erro instanceof SyntaxError) {
      return NextResponse.json(
        { erro: "Requisicao invalida." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { erro: "Erro interno do servidor." },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const resposta = NextResponse.json({
    mensagem: "Logout realizado com sucesso.",
  });
  resposta.cookies.set("token", "", { httpOnly: true, maxAge: 0, path: "/" });
  return resposta;
}
