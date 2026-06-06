import { describe, expect, it } from "vitest";
import type { StatusAtendimento } from "@prisma/client";

import {
  etapaPermitidaPorStatus,
  etapasParaStatus,
  podeTransicionar,
  proximoStatus,
  statusTerminais,
  ultimaEtapaPermitida,
  type EtapaAtendimento,
  type EtapaVisualStatus,
} from "@/domain/status";

const atendimentoId = "atendimento-123";

function statusDasEtapas(
  status: StatusAtendimento,
  statusAnteriorCancelamento?: StatusAtendimento | null,
) {
  return etapasParaStatus(
    status,
    atendimentoId,
    statusAnteriorCancelamento,
  ).map((etapa) => etapa.status);
}

function idsDasEtapas(status: StatusAtendimento) {
  return etapasParaStatus(status, atendimentoId).map((etapa) => etapa.id);
}

describe("regras de status do atendimento", () => {
  describe("proximoStatus", () => {
    it("retorna o proximo status do fluxo canonico", () => {
      expect(proximoStatus("EM_SOLICITACAO")).toBe("AGUARDANDO_ORCAMENTO");
      expect(proximoStatus("AGUARDANDO_ORCAMENTO")).toBe(
        "ORCAMENTO_REGISTRADO_AG_APROVACAO",
      );
      expect(proximoStatus("SERVICO_EM_ANDAMENTO")).toBe("SERVICO_FINALIZADO");
    });

    it("retorna null para status finalizado e cancelamentos", () => {
      expect(proximoStatus("SERVICO_FINALIZADO")).toBeNull();
      expect(proximoStatus("ORCAMENTO_CANCELADO")).toBeNull();
      expect(proximoStatus("RESERVA_CANCELADA")).toBeNull();
      expect(proximoStatus("ATENDIMENTO_CANCELADO")).toBeNull();
    });
  });

  describe("podeTransicionar", () => {
    it("permite transicoes validas do fluxo principal", () => {
      expect(podeTransicionar("EM_SOLICITACAO", "AGUARDANDO_ORCAMENTO")).toBe(
        true,
      );
      expect(
        podeTransicionar(
          "AGUARDANDO_ORCAMENTO",
          "ORCAMENTO_REGISTRADO_AG_APROVACAO",
        ),
      ).toBe(true);
      expect(
        podeTransicionar(
          "ORCAMENTO_REGISTRADO_AG_APROVACAO",
          "AGUARDANDO_RESERVA",
        ),
      ).toBe(true);
      expect(
        podeTransicionar("AGUARDANDO_RESERVA", "RESERVA_REGISTRADA_AG_ESCALA"),
      ).toBe(true);
      expect(
        podeTransicionar("RESERVA_REGISTRADA_AG_ESCALA", "ESCALA_DEFINIDA"),
      ).toBe(true);
      expect(podeTransicionar("ESCALA_DEFINIDA", "SERVICO_EM_ANDAMENTO")).toBe(
        true,
      );
      expect(
        podeTransicionar("SERVICO_EM_ANDAMENTO", "SERVICO_FINALIZADO"),
      ).toBe(true);
    });

    it("permite cancelamentos validos por etapa", () => {
      expect(
        podeTransicionar("AGUARDANDO_ORCAMENTO", "ORCAMENTO_CANCELADO"),
      ).toBe(true);
      expect(
        podeTransicionar(
          "ORCAMENTO_REGISTRADO_AG_APROVACAO",
          "ORCAMENTO_CANCELADO",
        ),
      ).toBe(true);
      expect(podeTransicionar("AGUARDANDO_RESERVA", "RESERVA_CANCELADA")).toBe(
        true,
      );
      expect(
        podeTransicionar("RESERVA_REGISTRADA_AG_ESCALA", "RESERVA_CANCELADA"),
      ).toBe(true);
      expect(podeTransicionar("ESCALA_DEFINIDA", "RESERVA_CANCELADA")).toBe(
        true,
      );
      expect(podeTransicionar("EM_SOLICITACAO", "ATENDIMENTO_CANCELADO")).toBe(
        true,
      );
    });

    it("bloqueia saltos de etapa e cancelamentos incompativeis", () => {
      expect(podeTransicionar("EM_SOLICITACAO", "AGUARDANDO_RESERVA")).toBe(
        false,
      );
      expect(
        podeTransicionar("AGUARDANDO_RESERVA", "ORCAMENTO_CANCELADO"),
      ).toBe(false);
      expect(
        podeTransicionar("SERVICO_EM_ANDAMENTO", "RESERVA_CANCELADA"),
      ).toBe(false);
    });

    it("bloqueia avancos a partir de status terminais", () => {
      expect(
        podeTransicionar("SERVICO_FINALIZADO", "SERVICO_EM_ANDAMENTO"),
      ).toBe(false);
      expect(
        podeTransicionar("ORCAMENTO_CANCELADO", "AGUARDANDO_RESERVA"),
      ).toBe(false);
      expect(podeTransicionar("RESERVA_CANCELADA", "ESCALA_DEFINIDA")).toBe(
        false,
      );
      expect(
        podeTransicionar("ATENDIMENTO_CANCELADO", "AGUARDANDO_ORCAMENTO"),
      ).toBe(false);
    });
  });

  describe("statusTerminais", () => {
    it("retorna os status terminais do atendimento", () => {
      expect(statusTerminais()).toEqual([
        "SERVICO_FINALIZADO",
        "ORCAMENTO_CANCELADO",
        "RESERVA_CANCELADA",
        "ATENDIMENTO_CANCELADO",
      ]);
    });

    it("nao inclui status em aberto", () => {
      const terminais = statusTerminais();

      expect(terminais).not.toContain("EM_SOLICITACAO");
      expect(terminais).not.toContain("AGUARDANDO_ORCAMENTO");
      expect(terminais).not.toContain("AGUARDANDO_RESERVA");
      expect(terminais).not.toContain("ESCALA_DEFINIDA");
    });
  });

  describe("ultimaEtapaPermitida", () => {
    it.each<[StatusAtendimento, EtapaAtendimento]>([
      ["EM_SOLICITACAO", "solicitacao"],
      ["AGUARDANDO_ORCAMENTO", "orcamento"],
      ["ORCAMENTO_REGISTRADO_AG_APROVACAO", "orcamento"],
      ["ORCAMENTO_CANCELADO", "orcamento"],
      ["AGUARDANDO_RESERVA", "reserva"],
      ["RESERVA_CANCELADA", "reserva"],
      ["RESERVA_REGISTRADA_AG_ESCALA", "escala"],
      ["ESCALA_DEFINIDA", "contrato"],
      ["SERVICO_EM_ANDAMENTO", "contrato"],
      ["SERVICO_FINALIZADO", "contrato"],
    ])("mapeia %s para a etapa %s", (status, etapaEsperada) => {
      expect(ultimaEtapaPermitida(status)).toBe(etapaEsperada);
    });

    it("usa o status anterior para atendimento cancelado", () => {
      expect(
        ultimaEtapaPermitida(
          "ATENDIMENTO_CANCELADO",
          "ORCAMENTO_REGISTRADO_AG_APROVACAO",
        ),
      ).toBe("orcamento");
      expect(
        ultimaEtapaPermitida(
          "ATENDIMENTO_CANCELADO",
          "RESERVA_REGISTRADA_AG_ESCALA",
        ),
      ).toBe("escala");
    });

    it("usa solicitacao quando atendimento cancelado nao tem status anterior", () => {
      expect(ultimaEtapaPermitida("ATENDIMENTO_CANCELADO")).toBe("solicitacao");
    });
  });

  describe("etapaPermitidaPorStatus", () => {
    it("permite somente etapas ate a etapa atual", () => {
      expect(etapaPermitidaPorStatus("solicitacao", "AGUARDANDO_RESERVA")).toBe(
        true,
      );
      expect(etapaPermitidaPorStatus("orcamento", "AGUARDANDO_RESERVA")).toBe(
        true,
      );
      expect(etapaPermitidaPorStatus("reserva", "AGUARDANDO_RESERVA")).toBe(
        true,
      );
      expect(etapaPermitidaPorStatus("escala", "AGUARDANDO_RESERVA")).toBe(
        false,
      );
      expect(etapaPermitidaPorStatus("contrato", "AGUARDANDO_RESERVA")).toBe(
        false,
      );
    });

    it("permite contrato quando a reserva ja aguarda escala", () => {
      expect(
        etapaPermitidaPorStatus("contrato", "RESERVA_REGISTRADA_AG_ESCALA"),
      ).toBe(true);
    });

    it("respeita a etapa original em atendimento cancelado", () => {
      expect(
        etapaPermitidaPorStatus(
          "orcamento",
          "ATENDIMENTO_CANCELADO",
          "ORCAMENTO_REGISTRADO_AG_APROVACAO",
        ),
      ).toBe(true);
      expect(
        etapaPermitidaPorStatus(
          "reserva",
          "ATENDIMENTO_CANCELADO",
          "ORCAMENTO_REGISTRADO_AG_APROVACAO",
        ),
      ).toBe(false);
    });
  });

  describe("etapasParaStatus", () => {
    it("retorna as cinco etapas esperadas", () => {
      expect(idsDasEtapas("EM_SOLICITACAO")).toEqual([
        "solicitacao",
        "orcamento",
        "reserva",
        "escala",
        "contrato",
      ]);
    });

    it("monta os links de cada etapa do atendimento", () => {
      expect(
        etapasParaStatus("EM_SOLICITACAO", atendimentoId).map(
          (etapa) => etapa.href,
        ),
      ).toEqual([
        "/atendimentos/atendimento-123/solicitacao",
        "/atendimentos/atendimento-123/orcamento",
        "/atendimentos/atendimento-123/reserva",
        "/atendimentos/atendimento-123/escala",
        "/atendimentos/atendimento-123/contrato",
      ]);
    });

    it("representa a primeira etapa do fluxo", () => {
      expect(statusDasEtapas("EM_SOLICITACAO")).toEqual([
        "atual",
        "pendente",
        "bloqueada",
        "bloqueada",
        "bloqueada",
      ] satisfies EtapaVisualStatus[]);
    });

    it("representa uma etapa intermediaria do fluxo", () => {
      expect(statusDasEtapas("AGUARDANDO_RESERVA")).toEqual([
        "concluida",
        "concluida",
        "atual",
        "pendente",
        "bloqueada",
      ] satisfies EtapaVisualStatus[]);
    });

    it("representa o fluxo finalizado com todas as etapas concluidas", () => {
      expect(statusDasEtapas("SERVICO_FINALIZADO")).toEqual([
        "concluida",
        "concluida",
        "concluida",
        "concluida",
        "concluida",
      ] satisfies EtapaVisualStatus[]);
    });

    it("representa cancelamento na etapa de orcamento", () => {
      expect(statusDasEtapas("ORCAMENTO_CANCELADO")).toEqual([
        "concluida",
        "cancelada",
        "bloqueada",
        "bloqueada",
        "bloqueada",
      ] satisfies EtapaVisualStatus[]);
    });

    it("representa cancelamento na etapa de reserva", () => {
      expect(statusDasEtapas("RESERVA_CANCELADA")).toEqual([
        "concluida",
        "concluida",
        "cancelada",
        "bloqueada",
        "bloqueada",
      ] satisfies EtapaVisualStatus[]);
    });

    it("representa atendimento cancelado a partir do status anterior", () => {
      expect(
        statusDasEtapas("ATENDIMENTO_CANCELADO", "ESCALA_DEFINIDA"),
      ).toEqual([
        "concluida",
        "concluida",
        "concluida",
        "concluida",
        "cancelada",
      ] satisfies EtapaVisualStatus[]);
    });

    it("representa atendimento cancelado sem status anterior como solicitacao cancelada", () => {
      expect(statusDasEtapas("ATENDIMENTO_CANCELADO")).toEqual([
        "cancelada",
        "bloqueada",
        "bloqueada",
        "bloqueada",
        "bloqueada",
      ] satisfies EtapaVisualStatus[]);
    });
  });
});
