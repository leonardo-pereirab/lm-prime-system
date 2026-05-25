let prisma;

function gerarCodigoAtendimento(ano, sequencia) {
  return `ATD-${ano}-${String(sequencia).padStart(5, "0")}`;
}

function extrairMaiorSequenciaPorAno(codigos) {
  const mapa = new Map();

  for (const item of codigos) {
    if (!item.codigo) {
      continue;
    }

    const partes = item.codigo.split("-");
    const ano = Number(partes[1]);
    const sequencia = Number(partes[2]);

    if (!Number.isFinite(ano) || !Number.isFinite(sequencia)) {
      continue;
    }

    mapa.set(ano, Math.max(mapa.get(ano) ?? 0, sequencia));
  }

  return mapa;
}

async function main() {
  const { PrismaClient } = await import("@prisma/client");

  prisma = new PrismaClient({
    log: ["error", "warn"],
  });

  const existentes = await prisma.atendimento.findMany({
    where: { codigo: { not: null } },
    select: { codigo: true },
  });

  const pendentes = await prisma.atendimento.findMany({
    where: { codigo: null },
    select: { id: true, createdAt: true },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });

  if (pendentes.length === 0) {
    console.log("Nenhum atendimento pendente de codigo.");
    return;
  }

  const sequenciasPorAno = extrairMaiorSequenciaPorAno(existentes);

  for (const atendimento of pendentes) {
    const ano = atendimento.createdAt.getUTCFullYear();
    const proximaSequencia = (sequenciasPorAno.get(ano) ?? 0) + 1;
    const codigo = gerarCodigoAtendimento(ano, proximaSequencia);

    await prisma.atendimento.update({
      where: { id: atendimento.id },
      data: { codigo },
    });

    sequenciasPorAno.set(ano, proximaSequencia);
    console.log(`${atendimento.id} -> ${codigo}`);
  }
}

main()
  .catch((error) => {
    console.error("Falha ao preencher codigos de atendimento.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
  });
