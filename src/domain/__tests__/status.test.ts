import { describe, expect, it } from "vitest";
import {
  etapaPermitidaPorStatus,
  etapasParaStatus,
  podeTransicionar,
  proximoStatus,
  statusTerminais,
  ultimaEtapaPermitida,
} from "@/domain/status";

describe("domain/status", () => {
  it("deve retornar AGUARDANDO_ORCAMENTO como proximo de EM_SOLICITACAO", () => {
    expect(proximoStatus("EM_SOLICITACAO")).toBe("AGUARDANDO_ORCAMENTO");
  });

  it("deve retornar null para status sem proximo na sequencia canonica", () => {
    expect(proximoStatus("ORCAMENTO_CANCELADO")).toBeNull();
  });

  it("deve invalidar transicao que pula etapa", () => {
    expect(
      podeTransicionar("EM_SOLICITACAO", "RESERVA_REGISTRADA_AG_ESCALA"),
    ).toBe(false);
  });

  it("deve listar os status terminais esperados", () => {
    expect(statusTerminais()).toEqual([
      "SERVICO_FINALIZADO",
      "ORCAMENTO_CANCELADO",
      "RESERVA_CANCELADA",
      "ATENDIMENTO_CANCELADO",
    ]);
  });

  it("deve mapear etapa atual para AGUARDANDO_RESERVA", () => {
    expect(ultimaEtapaPermitida("AGUARDANDO_RESERVA")).toBe("reserva");
  });

  it("deve bloquear acesso a etapa futura para status atual", () => {
    expect(
      etapaPermitidaPorStatus("contrato", "ORCAMENTO_REGISTRADO_AG_APROVACAO"),
    ).toBe(false);
  });

  it("deve marcar etapa como cancelada quando houver cancelamento", () => {
    const etapas = etapasParaStatus(
      "ATENDIMENTO_CANCELADO",
      "abc123",
      "AGUARDANDO_RESERVA",
    );
    const etapaReserva = etapas.find((etapa) => etapa.id === "reserva");

    expect(etapaReserva?.status).toBe("cancelada");
  });
});
