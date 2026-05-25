import { describe, expect, it, beforeEach, afterEach, afterAll } from "vitest";
import { orcamentoRepository } from "@/repositories/orcamentoRepository";
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

describeIntegracao.sequential("orcamentoRepository (integracao)", () => {
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

  it("deve listar somente orcamentos vencidos com atendimento pendente", async () => {
    const marcador = marcadorTeste("orcamento-vencido");

    const usuario = await prisma.usuario.create({
      data: {
        nome: `Usuario ${marcador}`,
        email: `${marcador}@teste.com`,
        senha: "hash",
        perfil: "ADMIN",
      },
    });
    ids.usuarios.push(usuario.id);

    const atendimentoVencido = await prisma.atendimento.create({
      data: {
        codigo: `ATD-2026-${String(Math.floor(Math.random() * 99999)).padStart(5, "0")}`,
        status: "ORCAMENTO_REGISTRADO_AG_APROVACAO",
        dataContato: new Date("2026-01-01T00:00:00.000Z"),
        qtdPassageiros: 3,
        tipoServico: "VIAGEM",
        precisaNotaFiscal: false,
        trajeto: { origem: "A", destino: "B" },
        leadNome: "Lead A",
        leadTelefone: "11911111111",
        criadoPor: usuario.id,
      },
    });
    ids.atendimentos.push(atendimentoVencido.id);

    const atendimentoNaoVencido = await prisma.atendimento.create({
      data: {
        codigo: `ATD-2026-${String(Math.floor(Math.random() * 99999)).padStart(5, "0")}`,
        status: "ORCAMENTO_REGISTRADO_AG_APROVACAO",
        dataContato: new Date("2026-01-01T00:00:00.000Z"),
        qtdPassageiros: 3,
        tipoServico: "VIAGEM",
        precisaNotaFiscal: false,
        trajeto: { origem: "A", destino: "B" },
        leadNome: "Lead B",
        leadTelefone: "11922222222",
        criadoPor: usuario.id,
      },
    });
    ids.atendimentos.push(atendimentoNaoVencido.id);

    const atendimentoCancelado = await prisma.atendimento.create({
      data: {
        codigo: `ATD-2026-${String(Math.floor(Math.random() * 99999)).padStart(5, "0")}`,
        status: "ORCAMENTO_CANCELADO",
        dataContato: new Date("2026-01-01T00:00:00.000Z"),
        qtdPassageiros: 3,
        tipoServico: "VIAGEM",
        precisaNotaFiscal: false,
        trajeto: { origem: "A", destino: "B" },
        leadNome: "Lead C",
        leadTelefone: "11933333333",
        criadoPor: usuario.id,
      },
    });
    ids.atendimentos.push(atendimentoCancelado.id);

    const vencido = await prisma.orcamento.create({
      data: {
        atendimentoId: atendimentoVencido.id,
        valorTotal: "1200.00",
        formaPagamento: "PIX",
        validoAte: new Date("2020-01-01T00:00:00.000Z"),
        veiculosPrevistos: [{ tipo: "VAN", quantidade: 1 }],
      },
    });
    ids.orcamentos.push(vencido.id);

    const naoVencido = await prisma.orcamento.create({
      data: {
        atendimentoId: atendimentoNaoVencido.id,
        valorTotal: "1300.00",
        formaPagamento: "PIX",
        validoAte: new Date("2099-01-01T00:00:00.000Z"),
        veiculosPrevistos: [{ tipo: "VAN", quantidade: 1 }],
      },
    });
    ids.orcamentos.push(naoVencido.id);

    const cancelado = await prisma.orcamento.create({
      data: {
        atendimentoId: atendimentoCancelado.id,
        valorTotal: "1400.00",
        formaPagamento: "PIX",
        validoAte: new Date("2020-01-01T00:00:00.000Z"),
        veiculosPrevistos: [{ tipo: "VAN", quantidade: 1 }],
      },
    });
    ids.orcamentos.push(cancelado.id);

    const resultado = await orcamentoRepository.listarVencidosPendentes(
      new Date("2026-01-20T00:00:00.000Z"),
    );

    expect(resultado.map((item) => item.id)).toContain(vencido.id);
    expect(resultado.map((item) => item.id)).not.toContain(naoVencido.id);
    expect(resultado.map((item) => item.id)).not.toContain(cancelado.id);
  });
});
