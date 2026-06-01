import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { orcamentoService } from "@/services/orcamentoService";
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

describeIntegracao.sequential("orcamentoService (integracao)", () => {
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

  it("deve cancelar automaticamente orcamentos vencidos", async () => {
    const marcador = marcadorTeste("orcamento-service-cron");

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
        status: "ORCAMENTO_REGISTRADO_AG_APROVACAO",
        dataContato: new Date("2026-01-01T00:00:00.000Z"),
        qtdPassageiros: 3,
        tipoServico: "VIAGEM",
        precisaNotaFiscal: false,
        trajeto: { origem: "A", destino: "B" },
        leadNome: "Lead Cron",
        leadTelefone: "11911111111",
        criadoPor: usuario.id,
      },
    });
    ids.atendimentos.push(atendimento.id);

    const orcamento = await prisma.orcamento.create({
      data: {
        atendimentoId: atendimento.id,
        valorTotal: "1200.00",
        formaPagamento: "PIX",
        validoAte: new Date("2026-01-05T00:00:00.000Z"),
        veiculosPrevistos: [{ tipo: "VAN", quantidade: 1 }],
      },
    });
    ids.orcamentos.push(orcamento.id);

    const referencia = new Date("2026-01-20T10:00:00.000Z");

    const resultado = await orcamentoService.cancelarVencidos(referencia);
    const atendimentoAtualizado = await prisma.atendimento.findUnique({
      where: { id: atendimento.id },
      select: {
        status: true,
        statusAnteriorCancelamento: true,
        canceladoEm: true,
      },
    });

    expect(resultado.processados).toBe(1);
    expect(resultado.cancelados).toBe(1);
    expect(atendimentoAtualizado?.status).toBe("ORCAMENTO_CANCELADO");
    expect(atendimentoAtualizado?.statusAnteriorCancelamento).toBe(
      "ORCAMENTO_REGISTRADO_AG_APROVACAO",
    );
    expect(atendimentoAtualizado?.canceladoEm).toEqual(referencia);
  });
});
