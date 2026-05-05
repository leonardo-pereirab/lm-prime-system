import { NextResponse, type NextRequest } from "next/server";
import { Prisma, type Prisma as PrismaTypes } from "@prisma/client";
import { clienteService } from "@/services/clienteService";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const cliente = await clienteService.buscarPorId(id);
  if (!cliente)
    return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  return NextResponse.json(cliente);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = (await request.json()) as PrismaTypes.ClienteUncheckedUpdateInput;

    if (!Object.keys(body).length) {
      return NextResponse.json(
        { erro: "Nenhum dado foi enviado para atualizacao." },
        { status: 400 },
      );
    }

    const cliente = await clienteService.atualizar(id, body);
    return NextResponse.json(cliente);
  } catch (erro) {
    if (
      erro instanceof Prisma.PrismaClientKnownRequestError &&
      erro.code === "P2025"
    ) {
      return NextResponse.json({ erro: "Cliente nao encontrado." }, { status: 404 });
    }

    if (
      erro instanceof Prisma.PrismaClientKnownRequestError &&
      erro.code === "P2002"
    ) {
      return NextResponse.json(
        { erro: "Ja existe um cliente com este CPF/CNPJ." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { erro: "Erro interno ao atualizar cliente." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await clienteService.deletar(id);
    return new NextResponse(null, { status: 204 });
  } catch (erro) {
    if (
      erro instanceof Prisma.PrismaClientKnownRequestError &&
      erro.code === "P2025"
    ) {
      return NextResponse.json({ erro: "Cliente nao encontrado." }, { status: 404 });
    }

    if (
      erro instanceof Prisma.PrismaClientKnownRequestError &&
      erro.code === "P2003"
    ) {
      return NextResponse.json(
        {
          erro:
            "Nao e possivel excluir este cliente pois ele possui registros vinculados. Desative-o em vez de excluir.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { erro: "Erro interno ao excluir cliente." },
      { status: 500 },
    );
  }
}
