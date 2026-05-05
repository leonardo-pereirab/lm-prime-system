// Uso: node --env-file=.env prisma/seed-usuario.js
// Cria/atualiza um usuário ADMIN para testes.

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_EMAIL ?? 'admin@lmprime.local';
  const senhaPlana = process.env.SEED_SENHA ?? 'Admin@123';
  const nome = process.env.SEED_NOME ?? 'Administrador';

  const senha = await bcrypt.hash(senhaPlana, 10);

  const usuario = await prisma.usuario.upsert({
    where: { email },
    update: { senha, ativo: true, perfil: 'ADMIN', nome },
    create: { email, senha, nome, perfil: 'ADMIN', ativo: true },
  });

  console.log('Usuário pronto:');
  console.log({ id: usuario.id, email: usuario.email, perfil: usuario.perfil });
  console.log(`Senha: ${senhaPlana}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
