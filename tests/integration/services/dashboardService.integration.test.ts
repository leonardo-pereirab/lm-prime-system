import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { dashboardService } from "@/services/dashboardService";
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

describeIntegracao.sequential("dashboardService (integracao)", () => {
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

  it("deve retornar indicadores e tops no periodo informado", async () => {
    const marcador = marcadorTeste("dashboard-service");

    const usuario = await prisma.usuario.create({
      data: {
        nome: `Usuario ${marcador}`,
        email: `${marcador}@teste.com`,
        senha: "hash",
        perfil: "ADMIN",
      },
    });
    ids.usuarios.push(usuario.id);

    const cliente = await prisma.cliente.create({
      data: {
        nome: `Cliente ${marcador}`,
        cpfCnpj: `9${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(
          0,
          14,
        ),
        telefone: "11999999999",
      },
    });
    ids.clientes.push(cliente.id);

    const motorista = await prisma.motorista.create({
      data: {
        nome: `Motorista ${marcador}`,
        cpf: `7${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(0, 11),
        telefone: "11977777777",
        cnh: `${Date.now()}`,
        cnhCategoria: "D",
        cnhValidade: new Date("2030-01-01T00:00:00.000Z"),
      },
    });
    ids.motoristas.push(motorista.id);

    const veiculo = await prisma.veiculo.create({
      data: {
        placa: `T${Math.floor(Math.random() * 8999 + 1000)}AA`,
        modelo: "Van Teste",
        marca: "Marca",
        ano: 2022,
        capacidade: 15,
        tipo: "VAN",
      },
    });
    ids.veiculos.push(veiculo.id);

    const parceiro = await prisma.parceiro.create({
      data: {
        nome: `Parceiro ${marcador}`,
        cnpj: `6${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(0, 14),
        telefone: "11966666666",
      },
    });
    ids.parceiros.push(parceiro.id);

    const atendimento = await prisma.atendimento.create({
      data: {
        codigo: `ATD-2026-${String(Math.floor(Math.random() * 99999)).padStart(5, "0")}`,
        status: "SERVICO_FINALIZADO",
        dataContato: new Date("2026-01-10T10:00:00.000Z"),
        dataServico: new Date("2026-02-10T12:00:00.000Z"),
        qtdPassageiros: 8,
        tipoServico: "EXCURSAO",
        precisaNotaFiscal: true,
        trajeto: { origem: "C", destino: "D" },
        clienteId: cliente.id,
        criadoPor: usuario.id,
      },
    });
    ids.atendimentos.push(atendimento.id);

    const orcamento = await prisma.orcamento.create({
      data: {
        atendimentoId: atendimento.id,
        valorTotal: "1500.00",
        formaPagamento: "PIX",
        validoAte: new Date("2026-01-20T00:00:00.000Z"),
        veiculosPrevistos: [{ tipo: "VAN", quantidade: 1 }],
      },
    });
    ids.orcamentos.push(orcamento.id);

    const reserva = await prisma.reserva.create({
      data: { atendimentoId: atendimento.id },
    });
    ids.reservas.push(reserva.id);

    const escala = await prisma.escala.create({
      data: { atendimentoId: atendimento.id },
    });
    ids.escalas.push(escala.id);

    await prisma.escalaMotorista.create({
      data: { escalaId: escala.id, motoristaId: motorista.id },
    });
    await prisma.escalaVeiculo.create({
      data: { escalaId: escala.id, veiculoId: veiculo.id },
    });
    await prisma.escalaParceiro.create({
      data: {
        escalaId: escala.id,
        parceiroId: parceiro.id,
        qtdVeiculos: 1,
        tipoVeiculo: "VAN",
        valorRepasse: "700.00",
      },
    });

    const periodo = {
      inicio: new Date("2025-01-01T00:00:00.000Z"),
      fim: new Date("2027-12-31T23:59:59.000Z"),
    };

    const indicadores = await dashboardService.obterIndicadores(periodo);

    expect(indicadores.totalAtendimentos).toBeGreaterThanOrEqual(1);
    expect(indicadores.totalServicos).toBeGreaterThanOrEqual(1);
    expect(indicadores.topRecursos.motoristas.length).toBeGreaterThanOrEqual(1);
    expect(indicadores.topRecursos.veiculos.length).toBeGreaterThanOrEqual(1);
    expect(indicadores.topRecursos.parceiros.length).toBeGreaterThanOrEqual(1);
  });
});
