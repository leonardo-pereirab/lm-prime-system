import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { prisma } from "@/lib/prisma";
import { atendimentoService } from "@/services/atendimentoService";
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

function criarSolicitacaoBase(indice: number) {
  return {
    leadNome: `Lead integracao ${indice}`,
    leadTelefone: `1199999999${indice}`,
    tipoServico: "VIAGEM" as const,
    dataContato: new Date(
      `2026-01-${String(indice + 10).padStart(2, "0")}T10:00:00.000Z`,
    ),
    dataServico: new Date(
      `2026-02-${String(indice + 10).padStart(2, "0")}T12:00:00.000Z`,
    ),
    precisaNotaFiscal: false,
    qtdPassageiros: 4 + indice,
    trajeto: [
      {
        origem: "Sao Paulo",
        destino: "Campinas",
        data: new Date(
          `2026-02-${String(indice + 10).padStart(2, "0")}T12:00:00.000Z`,
        ),
        hora: "08:00",
      },
    ],
  };
}

function extrairSequencia(codigo: string | null) {
  if (!codigo) {
    return null;
  }

  return Number(codigo.split("-").at(-1));
}

describeIntegracao.sequential("atendimentoService (integracao)", () => {
  let ids = criarContextoIds();

  beforeEach(() => {
    ids = criarContextoIds();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2099-01-10T10:00:00.000Z"));
  });

  afterEach(async () => {
    await limparContexto(ids);
    vi.useRealTimers();
  });

  afterAll(async () => {
    await desconectarBancoTeste();
  });

  it("deve gerar codigos sequenciais para novos atendimentos", async () => {
    const marcador = marcadorTeste("atendimento-service");
    const usuario = await prisma.usuario.create({
      data: {
        nome: `Usuario ${marcador}`,
        email: `${marcador}@teste.com`,
        senha: "hash",
        perfil: "ADMIN",
      },
    });
    ids.usuarios.push(usuario.id);

    const primeiro = await atendimentoService.criar(
      criarSolicitacaoBase(1),
      usuario.id,
    );
    const segundo = await atendimentoService.criar(
      criarSolicitacaoBase(2),
      usuario.id,
    );
    const terceiro = await atendimentoService.criar(
      criarSolicitacaoBase(3),
      usuario.id,
    );

    ids.atendimentos.push(primeiro.id, segundo.id, terceiro.id);

    expect(primeiro.codigo).toMatch(/^ATD-\d{4}-\d{5}$/);
    expect(segundo.codigo).toMatch(/^ATD-\d{4}-\d{5}$/);
    expect(terceiro.codigo).toMatch(/^ATD-\d{4}-\d{5}$/);

    const sequenciaPrimeiro = extrairSequencia(primeiro.codigo);
    const sequenciaSegundo = extrairSequencia(segundo.codigo);
    const sequenciaTerceiro = extrairSequencia(terceiro.codigo);

    expect(sequenciaPrimeiro).not.toBeNull();
    expect(sequenciaSegundo).toBe((sequenciaPrimeiro ?? 0) + 1);
    expect(sequenciaTerceiro).toBe((sequenciaSegundo ?? 0) + 1);
  });
});
