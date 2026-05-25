import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";
import { escalaService } from "@/services/escalaService";
import {
  criarContextoIds,
  desconectarBancoTeste,
  limparContexto,
  marcadorTeste,
} from "../helpers/repositoryTestUtils";

const temBanco = Boolean(
  process.env.DATABASE_URL_TEST ?? process.env.DATABASE_URL,
);
const describeIntegracao = temBanco ? describe : describe.skip;

describeIntegracao.sequential("escalaService (integracao)", () => {
  let ids = criarContextoIds();

  beforeEach(() => {
    ids = criarContextoIds();
  });

  afterEach(async () => {
    await limparContexto(ids);
  });

  afterAll(async () => {
    await desconectarBancoTeste();
  });

  it("deve definir escala com 2 motoristas, 1 veiculo e 1 parceiro", async () => {
    const marcador = marcadorTeste("escala-service");

    const usuario = await prisma.usuario.create({
      data: {
        nome: `Usuario ${marcador}`,
        email: `${marcador}@teste.com`,
        senha: "hash",
        perfil: "ADMIN",
      },
    });
    ids.usuarios.push(usuario.id);

    const atendimento = await prisma.atendimento.create({
      data: {
        codigo: `ATD-2099-${String(Math.floor(Math.random() * 99999)).padStart(5, "0")}`,
        status: "RESERVA_REGISTRADA_AG_ESCALA",
        dataContato: new Date("2099-03-01T10:00:00.000Z"),
        dataServico: new Date("2099-03-10T12:00:00.000Z"),
        qtdPassageiros: 8,
        tipoServico: "VIAGEM",
        precisaNotaFiscal: false,
        trajeto: [
          {
            origem: "Sao Paulo",
            destino: "Campinas",
            hora: "08:00",
            data: "2099-03-10",
          },
        ],
        leadNome: `Lead ${marcador}`,
        leadTelefone: "11999998888",
        criadoPor: usuario.id,
      },
    });
    ids.atendimentos.push(atendimento.id);

    const motorista1 = await prisma.motorista.create({
      data: {
        nome: `Motorista 1 ${marcador}`,
        cpf: `1${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(0, 11),
        telefone: "11911111111",
        cnh: `${Date.now()}1`,
        cnhCategoria: "D",
        cnhValidade: new Date("2099-12-31T00:00:00.000Z"),
      },
    });
    ids.motoristas.push(motorista1.id);

    const motorista2 = await prisma.motorista.create({
      data: {
        nome: `Motorista 2 ${marcador}`,
        cpf: `2${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(0, 11),
        telefone: "11922222222",
        cnh: `${Date.now()}2`,
        cnhCategoria: "D",
        cnhValidade: new Date("2099-12-31T00:00:00.000Z"),
      },
    });
    ids.motoristas.push(motorista2.id);

    const veiculo = await prisma.veiculo.create({
      data: {
        placa: `E${Math.floor(Math.random() * 8999 + 1000)}AA`,
        modelo: "Van executiva",
        marca: "Marca",
        ano: 2025,
        capacidade: 15,
        tipo: "VAN",
      },
    });
    ids.veiculos.push(veiculo.id);

    const parceiro = await prisma.parceiro.create({
      data: {
        nome: `Parceiro ${marcador}`,
        cnpj: `8${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(0, 14),
        telefone: "11933333333",
      },
    });
    ids.parceiros.push(parceiro.id);

    const escala = await escalaService.definir(atendimento.id, {
      observacoes: "Escala de integracao",
      motoristaIds: [motorista1.id, motorista2.id],
      veiculoIds: [veiculo.id],
      parceiros: [
        {
          parceiroId: parceiro.id,
          qtdVeiculos: 1,
          tipoVeiculo: "VAN",
          valorRepasse: 1200,
          observacoes: "Apoio terceirizado",
        },
      ],
    });

    if (escala?.id) {
      ids.escalas.push(escala.id);
    }

    expect(escala?.motoristas).toHaveLength(2);
    expect(escala?.veiculos).toHaveLength(1);
    expect(escala?.parceiros).toHaveLength(1);

    const atendimentoAtualizado = await prisma.atendimento.findUnique({
      where: { id: atendimento.id },
      select: { status: true },
    });

    expect(atendimentoAtualizado?.status).toBe("ESCALA_DEFINIDA");
  });
});
