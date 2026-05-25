import { prisma } from "@/lib/prisma";

type ContextoIds = {
  usuarios: string[];
  clientes: string[];
  motoristas: string[];
  veiculos: string[];
  parceiros: string[];
  atendimentos: string[];
  orcamentos: string[];
  reservas: string[];
  escalas: string[];
  contratos: string[];
};

export function criarContextoIds(): ContextoIds {
  return {
    usuarios: [],
    clientes: [],
    motoristas: [],
    veiculos: [],
    parceiros: [],
    atendimentos: [],
    orcamentos: [],
    reservas: [],
    escalas: [],
    contratos: [],
  };
}

export function marcadorTeste(prefixo = "fase07"): string {
  return `${prefixo}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export async function limparContexto(ids: ContextoIds): Promise<void> {
  if (ids.escalas.length > 0) {
    await prisma.escalaMotorista.deleteMany({
      where: { escalaId: { in: ids.escalas } },
    });
    await prisma.escalaVeiculo.deleteMany({
      where: { escalaId: { in: ids.escalas } },
    });
    await prisma.escalaParceiro.deleteMany({
      where: { escalaId: { in: ids.escalas } },
    });
  }

  if (ids.contratos.length > 0) {
    await prisma.contrato.deleteMany({ where: { id: { in: ids.contratos } } });
  }
  if (ids.escalas.length > 0) {
    await prisma.escala.deleteMany({ where: { id: { in: ids.escalas } } });
  }
  if (ids.reservas.length > 0) {
    await prisma.reserva.deleteMany({ where: { id: { in: ids.reservas } } });
  }
  if (ids.orcamentos.length > 0) {
    await prisma.orcamento.deleteMany({
      where: { id: { in: ids.orcamentos } },
    });
  }
  if (ids.atendimentos.length > 0) {
    await prisma.atendimento.deleteMany({
      where: { id: { in: ids.atendimentos } },
    });
  }
  if (ids.parceiros.length > 0) {
    await prisma.parceiro.deleteMany({ where: { id: { in: ids.parceiros } } });
  }
  if (ids.veiculos.length > 0) {
    await prisma.veiculo.deleteMany({ where: { id: { in: ids.veiculos } } });
  }
  if (ids.motoristas.length > 0) {
    await prisma.motorista.deleteMany({
      where: { id: { in: ids.motoristas } },
    });
  }
  if (ids.clientes.length > 0) {
    await prisma.cliente.deleteMany({ where: { id: { in: ids.clientes } } });
  }
  if (ids.usuarios.length > 0) {
    await prisma.usuario.deleteMany({ where: { id: { in: ids.usuarios } } });
  }
}

export async function desconectarBancoTeste(): Promise<void> {
  await prisma.$disconnect();
}
