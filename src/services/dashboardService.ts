import prisma from "@/lib/prisma";

export const dashboardService = {
  async obterMetricas() {
    const [totalAtendimentos, reservasAtivas, clientesCadastrados] =
      await Promise.all([
        prisma.atendimento.count(),
        prisma.atendimento.count({
          where: { status: "RESERVA_REGISTRADA_AG_ESCALA" },
        }),
        prisma.cliente.count(),
      ]);

    return {
      totalAtendimentos,
      reservasAtivas,
      clientesCadastrados,
    };
  },
};
