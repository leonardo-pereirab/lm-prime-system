import { describe, expect, it, beforeEach, afterEach, afterAll } from "vitest";
import { escalaRepository } from "@/repositories/escalaRepository";
import { prisma } from "@/lib/prisma";
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

describeIntegracao.sequential("escalaRepository (integracao)", () => {
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

  it("deve definir recursos N:M da escala em transacao", async () => {
    const marcador = marcadorTeste("escala-definir");

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
        codigo: `ATD-2026-${String(Math.floor(Math.random() * 99999)).padStart(5, "0")}`,
        status: "RESERVA_REGISTRADA_AG_ESCALA",
        dataContato: new Date("2026-01-01T00:00:00.000Z"),
        dataServico: new Date("2026-02-01T00:00:00.000Z"),
        qtdPassageiros: 10,
        tipoServico: "EXCURSAO",
        precisaNotaFiscal: false,
        trajeto: { origem: "A", destino: "B" },
        leadNome: "Lead",
        leadTelefone: "11955555555",
        criadoPor: usuario.id,
      },
    });
    ids.atendimentos.push(atendimento.id);

    const escala = await prisma.escala.create({
      data: { atendimentoId: atendimento.id },
    });
    ids.escalas.push(escala.id);

    const motorista = await prisma.motorista.create({
      data: {
        nome: `Motorista ${marcador}`,
        cpf: `5${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(0, 11),
        telefone: "11944444444",
        cnh: `${Date.now()}`,
        cnhCategoria: "D",
        cnhValidade: new Date("2030-01-01T00:00:00.000Z"),
      },
    });
    ids.motoristas.push(motorista.id);

    const veiculo = await prisma.veiculo.create({
      data: {
        placa: `S${Math.floor(Math.random() * 8999 + 1000)}AA`,
        modelo: "Micro",
        marca: "Marca",
        ano: 2023,
        capacidade: 20,
        tipo: "MICRO_ONIBUS",
      },
    });
    ids.veiculos.push(veiculo.id);

    const parceiro = await prisma.parceiro.create({
      data: {
        nome: `Parceiro ${marcador}`,
        cnpj: `4${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(0, 14),
        telefone: "11933333333",
      },
    });
    ids.parceiros.push(parceiro.id);

    const atualizado = await escalaRepository.definir(escala.id, {
      motoristasIds: [motorista.id],
      veiculosIds: [veiculo.id],
      parceiros: [
        {
          parceiroId: parceiro.id,
          qtdVeiculos: 2,
          tipoVeiculo: "VAN",
          valorRepasse: "900.00",
        },
      ],
    });

    expect(atualizado?.motoristas).toHaveLength(1);
    expect(atualizado?.veiculos).toHaveLength(1);
    expect(atualizado?.parceiros).toHaveLength(1);
    expect(atualizado?.parceiros[0]?.qtdVeiculos).toBe(2);
  });
});
