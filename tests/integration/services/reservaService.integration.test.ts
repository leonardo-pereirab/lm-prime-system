import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";
import { reservaService } from "@/services/reservaService";
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

describeIntegracao.sequential("reservaService (integracao)", () => {
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

  it("deve promover lead para cliente em transacao ao confirmar reserva", async () => {
    const marcador = marcadorTeste("reserva-service");

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
        status: "AGUARDANDO_RESERVA",
        dataContato: new Date("2099-01-10T10:00:00.000Z"),
        dataServico: new Date("2099-02-10T12:00:00.000Z"),
        qtdPassageiros: 6,
        tipoServico: "VIAGEM",
        precisaNotaFiscal: false,
        trajeto: [
          {
            origem: "Sao Paulo",
            destino: "Campinas",
            hora: "08:00",
            data: "2099-02-10",
          },
        ],
        leadNome: `Lead ${marcador}`,
        leadTelefone: "11999998888",
        criadoPor: usuario.id,
      },
    });
    ids.atendimentos.push(atendimento.id);

    const cpfCnpj = `9${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(
      0,
      14,
    );

    const reserva = await reservaService.criar(atendimento.id, {
      observacoes: "Reserva de integracao",
      novoCliente: {
        nome: `Cliente ${marcador}`,
        cpfCnpj,
        telefone: "11999998888",
        cep: "01001000",
        logradouro: "Praca da Se",
        numero: "100",
        bairro: "Se",
        cidade: "Sao Paulo",
        estado: "SP",
      },
    });

    ids.reservas.push(reserva.id);

    const atendimentoAtualizado = await prisma.atendimento.findUnique({
      where: { id: atendimento.id },
      select: {
        id: true,
        status: true,
        clienteId: true,
      },
    });

    expect(atendimentoAtualizado?.status).toBe("RESERVA_REGISTRADA_AG_ESCALA");
    expect(atendimentoAtualizado?.clienteId).toBeTruthy();

    const clienteCriado = await prisma.cliente.findUnique({
      where: { cpfCnpj },
      select: { id: true, nome: true },
    });

    expect(clienteCriado).toBeTruthy();
    expect(clienteCriado?.nome).toBe(`Cliente ${marcador}`);

    if (atendimentoAtualizado?.clienteId) {
      ids.clientes.push(atendimentoAtualizado.clienteId);
    }
  });
});
