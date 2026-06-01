import { get, put } from "@vercel/blob";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  NotFoundError,
  ValidationError,
  type DomainError,
} from "@/domain/errors";
import { gerarPdfContrato } from "@/lib/pdf";
import { formatarCpfCnpj, formatarData, formatarMoeda } from "@/lib/format";
import {
  contratoRepository,
  type ContratoFiltros,
} from "@/repositories/contratoRepository";
import { atendimentoRepository } from "@/repositories/atendimentoRepository";
import type { Prisma } from "@prisma/client";

function slugificar(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function normalizarDataParaNomeArquivo(data: Date) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function normalizarTimestamp(data: Date) {
  return data.toISOString().replace(/[:.]/g, "-");
}

const PREFIXO_STORAGE_LOCAL = "local://";
const DIRETORIO_STORAGE_LOCAL = path.join(process.cwd(), ".data", "blob-local");

function deveUsarStorageBlob() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
    (process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID),
  );
}

function caminhoLocalAbsoluto(caminhoRelativo: string) {
  const caminhoNormalizado = path
    .normalize(caminhoRelativo)
    .replace(/^([/\\])+/, "");
  return path.join(DIRETORIO_STORAGE_LOCAL, caminhoNormalizado);
}

async function salvarArquivoLocal(caminhoRelativo: string, buffer: Buffer) {
  const destino = caminhoLocalAbsoluto(caminhoRelativo);
  await mkdir(path.dirname(destino), { recursive: true });
  await writeFile(destino, buffer);
  return `${PREFIXO_STORAGE_LOCAL}${caminhoRelativo}`;
}

function ehUrlStorageLocal(url: string) {
  return url.startsWith(PREFIXO_STORAGE_LOCAL);
}

function caminhoRelativoStorageLocal(url: string) {
  return url.slice(PREFIXO_STORAGE_LOCAL.length);
}

type TrechoContrato = {
  origem: string;
  destino: string;
  data: string;
  hora: string;
};

function converterTrajeto(trajeto: Prisma.JsonValue): TrechoContrato[] {
  if (!Array.isArray(trajeto)) {
    return [];
  }

  const trechos: TrechoContrato[] = [];

  for (const item of trajeto) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      continue;
    }

    const trecho = item as Record<string, unknown>;

    const origem =
      typeof trecho.origem === "string" && trecho.origem.trim().length > 0
        ? trecho.origem.trim()
        : "Origem nao informada";
    const destino =
      typeof trecho.destino === "string" && trecho.destino.trim().length > 0
        ? trecho.destino.trim()
        : "Destino nao informado";
    const data =
      typeof trecho.data === "string" && trecho.data.trim().length > 0
        ? trecho.data.trim()
        : "Data nao informada";
    const hora =
      typeof trecho.hora === "string" && trecho.hora.trim().length > 0
        ? trecho.hora.trim()
        : "Hora nao informada";

    trechos.push({ origem, destino, data, hora });
  }

  return trechos;
}

function normalizarErroPdf(erro: unknown): DomainError {
  if (erro instanceof Error) {
    return new ValidationError(
      "ERRO_GERACAO_PDF",
      `Falha ao gerar o PDF do contrato: ${erro.message}`,
    );
  }

  return new ValidationError(
    "ERRO_GERACAO_PDF",
    "Falha ao gerar o PDF do contrato.",
  );
}

function normalizarErroStorage(erro: unknown): DomainError {
  if (erro instanceof Error) {
    return new ValidationError(
      "ERRO_STORAGE_CONTRATO",
      `Falha ao armazenar o PDF do contrato: ${erro.message}`,
    );
  }

  return new ValidationError(
    "ERRO_STORAGE_CONTRATO",
    "Falha ao armazenar o PDF do contrato.",
  );
}

export const contratoService = {
  async gerar(
    atendimentoIdOuDados:
      | string
      | (Prisma.ContratoUncheckedCreateInput & { geradoPor?: string }),
    userId?: string,
  ) {
    const atendimentoId =
      typeof atendimentoIdOuDados === "string"
        ? atendimentoIdOuDados
        : atendimentoIdOuDados.atendimentoId;
    const usuarioGerador =
      userId ??
      (typeof atendimentoIdOuDados === "string"
        ? undefined
        : atendimentoIdOuDados.geradoPor);

    if (!usuarioGerador) {
      throw new ValidationError(
        "USUARIO_OBRIGATORIO",
        "Usuário responsável pela geração do contrato é obrigatório.",
      );
    }

    const atendimento =
      await atendimentoRepository.buscarComEtapas(atendimentoId);

    if (!atendimento) {
      throw new NotFoundError(
        "ATENDIMENTO_NAO_ENCONTRADO",
        "Atendimento não encontrado.",
      );
    }

    if (!atendimento.reserva) {
      throw new ValidationError(
        "RESERVA_OBRIGATORIA",
        "Contrato so pode ser gerado apos a etapa de reserva.",
      );
    }

    if (!atendimento.orcamento) {
      throw new ValidationError(
        "ORCAMENTO_OBRIGATORIO",
        "Contrato so pode ser gerado com orcamento registrado.",
      );
    }

    const reserva = atendimento.reserva;
    const orcamento = atendimento.orcamento;

    const dataServico = atendimento.dataServico ?? new Date();
    const dataGeracao = new Date();
    const dataNomeArquivo = normalizarDataParaNomeArquivo(dataServico);
    const clienteSlug = slugificar(atendimento.cliente?.nome ?? "cliente");
    const nomeArquivo = `contrato_${clienteSlug}_${dataNomeArquivo}.pdf`;
    const timestamp = normalizarTimestamp(dataGeracao);
    const caminhoBlob = `contratos/${atendimentoId}/${timestamp}-${nomeArquivo}`;

    const trechos = converterTrajeto(atendimento.trajeto);

    const valorTotalContrato = formatarMoeda(Number(orcamento.valorTotal));

    const documentoContrato = {
      codigoAtendimento: atendimento.codigo ?? atendimento.id,
      dataGeracao: formatarData(dataGeracao),
      contratanteNome:
        atendimento.cliente?.nome ?? atendimento.leadNome ?? "Nao informado",
      contratanteDocumento: atendimento.cliente?.cpfCnpj
        ? formatarCpfCnpj(atendimento.cliente.cpfCnpj)
        : "Nao informado",
      contratadaNome: "LM Prime",
      tipoServico: atendimento.tipoServico,
      passageiros: atendimento.qtdPassageiros,
      trechos:
        trechos.length > 0
          ? trechos
          : [
              {
                origem: "Origem nao informada",
                destino: "Destino nao informado",
                data: "Data nao informada",
                hora: "Hora nao informada",
              },
            ],
      valorTotal: valorTotalContrato,
      formaPagamento: orcamento.formaPagamento,
      observacoes: reserva.observacoes ?? orcamento.observacoes ?? undefined,
    };

    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await gerarPdfContrato(documentoContrato, nomeArquivo);
    } catch (erro) {
      throw normalizarErroPdf(erro);
    }

    let pdfUrl: string;
    try {
      if (deveUsarStorageBlob()) {
        const blob = await put(caminhoBlob, pdfBuffer, {
          access: "private",
          contentType: "application/pdf",
        });
        pdfUrl = blob.url;
      } else if (process.env.NODE_ENV !== "production") {
        pdfUrl = await salvarArquivoLocal(caminhoBlob, pdfBuffer);
      } else {
        throw new ValidationError(
          "BLOB_TOKEN_OBRIGATORIO",
          "Credenciais do Blob nao configuradas no ambiente de producao.",
        );
      }
    } catch (erro) {
      throw normalizarErroStorage(erro);
    }

    return contratoRepository.criar({
      atendimentoId,
      nomeArquivo,
      pdfUrl,
      geradoPor: usuarioGerador,
    });
  },

  async listar(filtros: ContratoFiltros = {}) {
    return contratoRepository.listar(filtros);
  },

  async listarPaginado(filtros: ContratoFiltros = {}) {
    return contratoRepository.listarPaginado(filtros);
  },

  async listarTodos() {
    return this.listar();
  },

  async listarPorAtendimento(atendimentoId: string) {
    return contratoRepository.listarPorAtendimento(atendimentoId);
  },

  async buscarPorAtendimento(atendimentoId: string) {
    const contrato =
      await contratoRepository.buscarPorAtendimento(atendimentoId);

    if (!contrato) {
      throw new NotFoundError(
        "CONTRATO_NAO_ENCONTRADO",
        "Contrato não encontrado.",
      );
    }

    return contrato;
  },

  async obterDownloadUrl(contratoId: string) {
    const contrato = await contratoRepository.buscarPorId(contratoId);

    if (!contrato || !contrato.ativo) {
      throw new NotFoundError(
        "CONTRATO_NAO_ENCONTRADO",
        "Contrato não encontrado.",
      );
    }

    if (!contrato.pdfUrl) {
      throw new ValidationError(
        "CONTRATO_SEM_ARQUIVO",
        "Contrato não possui arquivo de PDF disponível.",
      );
    }

    return contrato.pdfUrl;
  },

  async obterArquivoDownload(contratoId: string) {
    const contrato = await contratoRepository.buscarPorId(contratoId);

    if (!contrato || !contrato.ativo) {
      throw new NotFoundError(
        "CONTRATO_NAO_ENCONTRADO",
        "Contrato nao encontrado.",
      );
    }

    if (!contrato.pdfUrl) {
      throw new ValidationError(
        "CONTRATO_SEM_ARQUIVO",
        "Contrato nao possui arquivo de PDF disponivel.",
      );
    }

    if (ehUrlStorageLocal(contrato.pdfUrl)) {
      const caminhoRelativo = caminhoRelativoStorageLocal(contrato.pdfUrl);
      const caminhoAbsoluto = caminhoLocalAbsoluto(caminhoRelativo);
      const [buffer, metadata] = await Promise.all([
        readFile(caminhoAbsoluto),
        stat(caminhoAbsoluto),
      ]);

      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new Uint8Array(buffer));
          controller.close();
        },
      });

      return {
        nomeArquivo: contrato.nomeArquivo,
        contentType: "application/pdf",
        etag: `\"${metadata.size}-${metadata.mtimeMs}\"`,
        stream,
      };
    }

    const arquivo = await get(contrato.pdfUrl, { access: "private" });

    if (!arquivo || arquivo.statusCode !== 200 || !arquivo.stream) {
      throw new NotFoundError(
        "ARQUIVO_CONTRATO_NAO_ENCONTRADO",
        "Arquivo do contrato nao encontrado no storage.",
      );
    }

    return {
      nomeArquivo: contrato.nomeArquivo,
      contentType: arquivo.blob.contentType ?? "application/pdf",
      etag: arquivo.blob.etag,
      stream: arquivo.stream,
    };
  },

  async desativar(id: string) {
    const contrato = await contratoRepository.buscarPorId(id);

    if (!contrato) {
      throw new NotFoundError(
        "CONTRATO_NAO_ENCONTRADO",
        "Contrato não encontrado.",
      );
    }

    return contratoRepository.desativar(id);
  },
};
