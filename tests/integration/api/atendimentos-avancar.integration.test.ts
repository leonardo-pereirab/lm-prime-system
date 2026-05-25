import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { NextRequest } from "next/server";
import type { Session } from "@/lib/auth";
import * as auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { POST as postAvancarAtendimento } from "@/app/api/atendimentos/[id]/avancar/route";
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

describeIntegracao.sequential(
  "api/atendimentos/[id]/avancar (integracao)",
  () => {
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

    it("deve avancar atendimento para orcamento", async () => {
      const marcador = marcadorTeste("api-avancar");

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
          status: "EM_SOLICITACAO",
          dataContato: new Date("2026-01-10T10:00:00.000Z"),
          qtdPassageiros: 4,
          tipoServico: "VIAGEM",
          precisaNotaFiscal: false,
          trajeto: [
            { origem: "A", destino: "B", data: "2026-01-12", hora: "08:00" },
          ],
          leadNome: "Lead Teste",
          leadTelefone: "11999999999",
          criadoPor: usuario.id,
        },
      });
      ids.atendimentos.push(atendimento.id);

      vi.spyOn(auth, "requireSession").mockResolvedValue({
        id: usuario.id,
        email: usuario.email,
        perfil: usuario.perfil,
        iat: 0,
        exp: 0,
      } as Session);

      const request = new NextRequest(
        `http://localhost:3000/api/atendimentos/${atendimento.id}/avancar`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ para: "ORCAMENTO" }),
        },
      );

      const response = await postAvancarAtendimento(request, {
        params: Promise.resolve({ id: atendimento.id }),
      });

      const payload = (await response.json()) as {
        success: boolean;
        data?: { status?: string };
      };

      expect(response.status).toBe(200);
      expect(payload.success).toBe(true);
      expect(payload.data?.status).toBe("AGUARDANDO_ORCAMENTO");

      vi.restoreAllMocks();
    });
  },
);
