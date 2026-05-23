import { NextResponse, type NextRequest } from "next/server";
import { Prisma, type Prisma as PrismaTypes } from "@prisma/client";
import { clienteService } from "@/services/clienteService";

export async function GET() {
  const clientes = await clienteService.listarTodos();
  return NextResponse.json(clientes);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PrismaTypes.ClienteUncheckedCreateInput;

    const nome = body.nome?.trim();
    const cpfCnpj = body.cpfCnpj?.trim();
    const telefone = body.telefone?.trim();

    if (!nome || !cpfCnpj || !telefone) {
      return NextResponse.json(
        { erro: "Nome, CPF/CNPJ e telefone sao obrigatorios." },
        { status: 400 },
      );
    }

    const cliente = await clienteService.criar({
      ...body,
      nome,
      cpfCnpj,
      telefone,
    });

    return NextResponse.json(cliente, { status: 201 });
  } catch (erro) {
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
      { erro: "Erro interno ao criar cliente." },
      { status: 500 },
    );
  }
}
