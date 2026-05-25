import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const { putMock } = vi.hoisted(() => {
  return {
    putMock: vi.fn(async (_pathname: string, body: BodyInit) => {
      let tamanho = 0;

      if (typeof body === "string") {
        tamanho = Buffer.byteLength(body);
      } else if (body instanceof ArrayBuffer) {
        tamanho = body.byteLength;
      } else if (ArrayBuffer.isView(body)) {
        tamanho = body.byteLength;
      }

      return {
        pathname: "contratos/mock/teste.pdf",
        contentType: "application/pdf",
        contentDisposition: 'attachment; filename="teste.pdf"',
        url: "https://blob-teste.private.blob.vercel-storage.com/contratos/mock/teste.pdf",
        downloadUrl:
          "https://blob-teste.private.blob.vercel-storage.com/contratos/mock/teste.pdf?download=1",
        etag: '"etag-mock"',
        tamanho,
      };
    }),
  };
});

vi.mock("@vercel/blob", () => ({
  put: putMock,
  get: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { contratoService } from "@/services/contratoService";
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

describeIntegracao.sequential("contratoService (integracao)", () => {
  let ids = criarContextoIds();

  beforeEach(() => {
    ids = criarContextoIds();
    putMock.mockClear();
  });

  afterEach(async () => {
    await limparContexto(ids);
  });

  afterAll(async () => {
    await desconectarBancoTeste();
  });

  it("deve gerar contrato em PDF e persistir metadados", async () => {
    const marcador = marcadorTeste("contrato-service");

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
        cpfCnpj: `8${Date.now()}${Math.floor(Math.random() * 100000)}`.slice(
          0,
          14,
        ),
        telefone: "11999990000",
      },
    });
    ids.clientes.push(cliente.id);

    const atendimento = await prisma.atendimento.create({
      data: {
        codigo: `ATD-2099-${String(Math.floor(Math.random() * 99999)).padStart(5, "0")}`,
        status: "RESERVA_REGISTRADA_AG_ESCALA",
        dataContato: new Date("2099-05-10T10:00:00.000Z"),
        dataServico: new Date("2099-06-15T09:30:00.000Z"),
        qtdPassageiros: 12,
        tipoServico: "VIAGEM",
        precisaNotaFiscal: false,
        trajeto: [
          {
            origem: "Campinas",
            destino: "Sao Paulo",
            data: "2099-06-15",
            hora: "09:30",
          },
        ],
        clienteId: cliente.id,
        criadoPor: usuario.id,
      },
    });
    ids.atendimentos.push(atendimento.id);

    const orcamento = await prisma.orcamento.create({
      data: {
        atendimentoId: atendimento.id,
        valorTotal: "1850.00",
        formaPagamento: "PIX",
        validoAte: new Date("2099-05-20T00:00:00.000Z"),
        veiculosPrevistos: [
          {
            tipoVeiculo: "VAN",
            quantidade: 1,
          },
        ],
      },
    });
    ids.orcamentos.push(orcamento.id);

    const reserva = await prisma.reserva.create({
      data: {
        atendimentoId: atendimento.id,
        observacoes: "Confirmacao da reserva",
      },
    });
    ids.reservas.push(reserva.id);

    const contrato1 = await contratoService.gerar(atendimento.id, usuario.id);
    ids.contratos.push(contrato1.id);

    expect(contrato1.nomeArquivo).toContain("contrato_");
    expect(contrato1.pdfUrl).toContain("private.blob.vercel-storage.com");

    const primeiraChamada = putMock.mock.calls[0];
    expect(primeiraChamada).toBeDefined();

    const corpoUpload = primeiraChamada?.[1];
    let tamanhoUpload = 0;
    if (typeof corpoUpload === "string") {
      tamanhoUpload = Buffer.byteLength(corpoUpload);
    } else if (corpoUpload instanceof ArrayBuffer) {
      tamanhoUpload = corpoUpload.byteLength;
    } else if (ArrayBuffer.isView(corpoUpload)) {
      tamanhoUpload = corpoUpload.byteLength;
    }

    expect(tamanhoUpload).toBeGreaterThan(0);

    const contrato2 = await contratoService.gerar(atendimento.id, usuario.id);
    ids.contratos.push(contrato2.id);

    expect(contrato2.id).not.toBe(contrato1.id);

    const totalContratos = await prisma.contrato.count({
      where: {
        atendimentoId: atendimento.id,
        ativo: true,
      },
    });

    expect(totalContratos).toBe(2);
  });
});
