import { describe, expect, it, beforeEach, afterEach, afterAll } from "vitest";
import { atendimentoRepository } from "@/repositories/atendimentoRepository";
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

describeIntegracao.sequential("atendimentoRepository (integracao)", () => {
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

  it("deve listar com filtros por status e codigo", async () => {
    const marcador = marcadorTeste("atendimento-listar");

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

    const atendimento1 = await prisma.atendimento.create({
      data: {
        codigo: `ATD-2026-${String(11).padStart(5, "0")}`,
        status: "EM_SOLICITACAO",
        dataContato: new Date("2026-01-10T10:00:00.000Z"),
        dataServico: new Date("2026-02-10T12:00:00.000Z"),
        qtdPassageiros: 5,
        tipoServico: "VIAGEM",
        precisaNotaFiscal: false,
        trajeto: { origem: "A", destino: "B" },
        clienteId: cliente.id,
        criadoPor: usuario.id,
      },
    });
    ids.atendimentos.push(atendimento1.id);

    const atendimento2 = await prisma.atendimento.create({
      data: {
        codigo: `ATD-2026-${String(12).padStart(5, "0")}`,
        status: "SERVICO_FINALIZADO",
        dataContato: new Date("2026-01-11T10:00:00.000Z"),
        dataServico: new Date("2026-02-11T12:00:00.000Z"),
        qtdPassageiros: 8,
        tipoServico: "EXCURSAO",
        precisaNotaFiscal: true,
        trajeto: { origem: "C", destino: "D" },
        clienteId: cliente.id,
        criadoPor: usuario.id,
      },
    });
    ids.atendimentos.push(atendimento2.id);

    const resultado = await atendimentoRepository.listar({
      status: "EM_SOLICITACAO",
      busca: "00011",
      clienteId: cliente.id,
      pagina: 1,
      tamanho: 10,
    });

    expect(resultado).toHaveLength(1);
    expect(resultado[0]?.id).toBe(atendimento1.id);
  });

  it("deve calcular proxima sequencia por ano", async () => {
    const marcador = marcadorTeste("atendimento-seq");

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
        codigo: "ATD-2026-00009",
        status: "EM_SOLICITACAO",
        dataContato: new Date("2026-01-10T10:00:00.000Z"),
        qtdPassageiros: 2,
        tipoServico: "VIAGEM",
        precisaNotaFiscal: false,
        trajeto: { origem: "A", destino: "B" },
        leadNome: "Lead",
        leadTelefone: "11988888888",
        criadoPor: usuario.id,
      },
    });
    ids.atendimentos.push(atendimento.id);

    const sequencia = await atendimentoRepository.proximaSequenciaPorAno(2026);

    expect(sequencia).toBeGreaterThanOrEqual(10);
  });

  it("deve buscar atendimento com etapas relacionadas", async () => {
    const marcador = marcadorTeste("atendimento-etapas");

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
        cpfCnpj: `8${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(
          0,
          14,
        ),
        telefone: "11999999998",
      },
    });
    ids.clientes.push(cliente.id);

    const motorista = await prisma.motorista.create({
      data: {
        nome: `Motorista ${marcador}`,
        cpf: String(Date.now() + Math.floor(Math.random() * 1_000_000)).slice(
          -11,
        ),
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
        status: "RESERVA_REGISTRADA_AG_ESCALA",
        dataContato: new Date("2026-01-10T10:00:00.000Z"),
        dataServico: new Date("2026-03-10T12:00:00.000Z"),
        qtdPassageiros: 12,
        tipoServico: "EXCURSAO",
        precisaNotaFiscal: true,
        trajeto: { origem: "X", destino: "Y" },
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

    const contrato = await prisma.contrato.create({
      data: {
        atendimentoId: atendimento.id,
        nomeArquivo: `contrato-${marcador}.pdf`,
        geradoPor: usuario.id,
      },
    });
    ids.contratos.push(contrato.id);

    const resultado = await atendimentoRepository.buscarComEtapas(
      atendimento.id,
    );

    expect(resultado?.orcamento?.id).toBe(orcamento.id);
    expect(resultado?.reserva?.id).toBe(reserva.id);
    expect(resultado?.escala?.motoristas).toHaveLength(1);
    expect(resultado?.contratos).toHaveLength(1);
  });
});
