// Uso: node --env-file=.env prisma/seed-usuario.js

async function main() {
  const [{ PrismaClient }, bcryptModule] = await Promise.all([
    import("@prisma/client"),
    import("bcryptjs"),
  ]);

  const bcrypt = bcryptModule.default;
  const prisma = new PrismaClient();

  try {
    const email = process.env.SEED_EMAIL ?? "admin@lmprime.local";
    const senhaPlana = process.env.SEED_SENHA ?? "Admin@123";
    const nome = process.env.SEED_NOME ?? "Administrador";
    const cpf = process.env.SEED_CPF ?? "00000000001";
    const telefone = process.env.SEED_TELEFONE ?? "11999999999";

    const senha = await bcrypt.hash(senhaPlana, 10);

    const usuario = await prisma.usuario.upsert({
      where: { email },
      update: { senha, ativo: true, perfil: "ADMIN", nome },
      create: { email, senha, nome, perfil: "ADMIN", ativo: true },
    });

    await prisma.funcionario.upsert({
      where: { usuarioId: usuario.id },
      update: {
        estado: "ATIVO",
        classificacao: "GERENTE",
        nomeCompleto: nome,
        emailCorporativo: email,
        cpf,
        telefonePrincipal: telefone,
        cep: "00000000",
        logradouro: "Nao informado",
        numero: "S/N",
        bairro: "Nao informado",
        cidade: "Nao informado",
        estadoUf: "SP",
      },
      create: {
        usuarioId: usuario.id,
        estado: "ATIVO",
        classificacao: "GERENTE",
        matricula: "GER-00001",
        nomeCompleto: nome,
        emailCorporativo: email,
        cpf,
        telefonePrincipal: telefone,
        cep: "00000000",
        logradouro: "Nao informado",
        numero: "S/N",
        bairro: "Nao informado",
        cidade: "Nao informado",
        estadoUf: "SP",
      },
    });

    console.log("Usuário pronto:");
    console.log({
      id: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil,
    });
    console.log(`Senha: ${senhaPlana}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
