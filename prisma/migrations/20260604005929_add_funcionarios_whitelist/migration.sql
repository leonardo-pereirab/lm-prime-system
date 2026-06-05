-- CreateEnum
CREATE TYPE "EstadoFuncionario" AS ENUM ('CONVIDADO', 'ATIVO', 'INATIVO');

-- CreateEnum
CREATE TYPE "ClassificacaoFuncionario" AS ENUM ('GERENTE', 'ATENDENTE');

-- CreateTable
CREATE TABLE "funcionarios" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "estado" "EstadoFuncionario" NOT NULL DEFAULT 'CONVIDADO',
    "classificacao" "ClassificacaoFuncionario" NOT NULL DEFAULT 'ATENDENTE',
    "matricula" TEXT NOT NULL,
    "nomeCompleto" TEXT NOT NULL,
    "emailCorporativo" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "telefonePrincipal" TEXT NOT NULL,
    "telefoneAdicional" TEXT,
    "cep" TEXT NOT NULL,
    "logradouro" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "complemento" TEXT,
    "bairro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estadoUf" TEXT NOT NULL,
    "aceitouTermosEm" TIMESTAMP(3),
    "versaoTermosAceita" TEXT,
    "anonimizadoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "funcionarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "funcionarios_usuarioId_key" ON "funcionarios"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "funcionarios_matricula_key" ON "funcionarios"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "funcionarios_emailCorporativo_key" ON "funcionarios"("emailCorporativo");

-- CreateIndex
CREATE UNIQUE INDEX "funcionarios_cpf_key" ON "funcionarios"("cpf");

-- CreateIndex
CREATE INDEX "funcionarios_estado_idx" ON "funcionarios"("estado");

-- CreateIndex
CREATE INDEX "funcionarios_classificacao_idx" ON "funcionarios"("classificacao");

-- AddForeignKey
ALTER TABLE "funcionarios" ADD CONSTRAINT "funcionarios_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
