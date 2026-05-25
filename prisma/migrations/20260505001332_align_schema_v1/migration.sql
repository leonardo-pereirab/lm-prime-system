/*
  Warnings:

  - You are about to drop the column `destino` on the `atendimentos` table. All the data in the column will be lost.
  - You are about to drop the column `destinoRetorno` on the `atendimentos` table. All the data in the column will be lost.
  - You are about to drop the column `emiteNf` on the `atendimentos` table. All the data in the column will be lost.
  - You are about to drop the column `encerradoEm` on the `atendimentos` table. All the data in the column will be lost.
  - You are about to drop the column `horaRetorno` on the `atendimentos` table. All the data in the column will be lost.
  - You are about to drop the column `horaSaida` on the `atendimentos` table. All the data in the column will be lost.
  - You are about to drop the column `localRetorno` on the `atendimentos` table. All the data in the column will be lost.
  - You are about to drop the column `localSaida` on the `atendimentos` table. All the data in the column will be lost.
  - You are about to drop the column `temRetorno` on the `atendimentos` table. All the data in the column will be lost.
  - You are about to drop the column `usuarioId` on the `atendimentos` table. All the data in the column will be lost.
  - You are about to drop the column `uf` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `textoGerado` on the `contratos` table. All the data in the column will be lost.
  - You are about to drop the column `urlPdf` on the `contratos` table. All the data in the column will be lost.
  - You are about to drop the column `motoristaId` on the `escala` table. All the data in the column will be lost.
  - You are about to drop the column `parceiroId` on the `escala` table. All the data in the column will be lost.
  - You are about to drop the column `veiculoId` on the `escala` table. All the data in the column will be lost.
  - You are about to drop the column `categoriaCnh` on the `motoristas` table. All the data in the column will be lost.
  - You are about to drop the column `qtdVeiculos` on the `orcamentos` table. All the data in the column will be lost.
  - You are about to drop the column `tiposVeiculos` on the `orcamentos` table. All the data in the column will be lost.
  - You are about to drop the column `vencimento` on the `orcamentos` table. All the data in the column will be lost.
  - You are about to drop the column `contato` on the `parceiros` table. All the data in the column will be lost.
  - You are about to drop the column `razaoSocial` on the `parceiros` table. All the data in the column will be lost.
  - You are about to drop the column `clienteId` on the `reservas` table. All the data in the column will be lost.
  - You are about to drop the column `dataConfirmacao` on the `reservas` table. All the data in the column will be lost.
  - Added the required column `criadoPor` to the `atendimentos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trajeto` to the `atendimentos` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `tipoServico` on the `atendimentos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `geradoPor` to the `contratos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nomeArquivo` to the `contratos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cnhCategoria` to the `motoristas` table without a default value. This is not possible if the table is not empty.
  - Made the column `cnhValidade` on table `motoristas` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `veiculosPrevistos` to the `orcamentos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nome` to the `parceiros` table without a default value. This is not possible if the table is not empty.
  - Made the column `cnpj` on table `parceiros` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `tipo` on the `veiculos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TipoServico" AS ENUM ('VIAGEM', 'EXCURSAO', 'PASSEIO', 'FEIRA', 'CONVENCAO', 'CASAMENTO', 'TRANSFERE', 'OUTRO');

-- CreateEnum
CREATE TYPE "TipoVeiculo" AS ENUM ('CARRO_PASSEIO', 'VAN', 'MICRO_ONIBUS', 'ONIBUS', 'OUTRO');

-- DropForeignKey
ALTER TABLE "atendimentos" DROP CONSTRAINT "atendimentos_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "escala" DROP CONSTRAINT "escala_motoristaId_fkey";

-- DropForeignKey
ALTER TABLE "escala" DROP CONSTRAINT "escala_parceiroId_fkey";

-- DropForeignKey
ALTER TABLE "escala" DROP CONSTRAINT "escala_veiculoId_fkey";

-- DropForeignKey
ALTER TABLE "reservas" DROP CONSTRAINT "reservas_clienteId_fkey";

-- DropIndex
DROP INDEX "atendimentos_dataContato_idx";

-- DropIndex
DROP INDEX "atendimentos_usuarioId_idx";

-- DropIndex
DROP INDEX "contratos_atendimentoId_key";

-- DropIndex
DROP INDEX "reservas_clienteId_idx";

-- AlterTable
ALTER TABLE "atendimentos" DROP COLUMN "destino",
DROP COLUMN "destinoRetorno",
DROP COLUMN "emiteNf",
DROP COLUMN "encerradoEm",
DROP COLUMN "horaRetorno",
DROP COLUMN "horaSaida",
DROP COLUMN "localRetorno",
DROP COLUMN "localSaida",
DROP COLUMN "temRetorno",
DROP COLUMN "usuarioId",
ADD COLUMN     "canceladoEm" TIMESTAMP(3),
ADD COLUMN     "canceladoPor" TEXT,
ADD COLUMN     "criadoPor" TEXT NOT NULL,
ADD COLUMN     "dataServico" TIMESTAMP(3),
ADD COLUMN     "precisaNotaFiscal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "statusAnteriorCancelamento" "StatusAtendimento",
ADD COLUMN     "trajeto" JSONB NOT NULL,
ALTER COLUMN "codigo" DROP NOT NULL,
DROP COLUMN "tipoServico",
ADD COLUMN     "tipoServico" "TipoServico" NOT NULL;

-- AlterTable
ALTER TABLE "clientes" DROP COLUMN "uf",
ADD COLUMN     "estado" TEXT,
ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "telefoneSec" TEXT;

-- AlterTable
ALTER TABLE "contratos" DROP COLUMN "textoGerado",
DROP COLUMN "urlPdf",
ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "geradoPor" TEXT NOT NULL,
ADD COLUMN     "nomeArquivo" TEXT NOT NULL,
ADD COLUMN     "pdfUrl" TEXT;

-- AlterTable
ALTER TABLE "escala" DROP COLUMN "motoristaId",
DROP COLUMN "parceiroId",
DROP COLUMN "veiculoId";

-- AlterTable
ALTER TABLE "motoristas" DROP COLUMN "categoriaCnh",
ADD COLUMN     "cnhCategoria" TEXT NOT NULL,
ADD COLUMN     "observacoes" TEXT,
ALTER COLUMN "cnhValidade" SET NOT NULL;

-- AlterTable
ALTER TABLE "orcamentos" DROP COLUMN "qtdVeiculos",
DROP COLUMN "tiposVeiculos",
DROP COLUMN "vencimento",
ADD COLUMN     "dataVencimento" TIMESTAMP(3),
ADD COLUMN     "veiculosPrevistos" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "parceiros" DROP COLUMN "contato",
DROP COLUMN "razaoSocial",
ADD COLUMN     "bairro" TEXT,
ADD COLUMN     "cep" TEXT,
ADD COLUMN     "cidade" TEXT,
ADD COLUMN     "complemento" TEXT,
ADD COLUMN     "estado" TEXT,
ADD COLUMN     "logradouro" TEXT,
ADD COLUMN     "nome" TEXT NOT NULL,
ADD COLUMN     "numero" TEXT,
ADD COLUMN     "observacoes" TEXT,
ALTER COLUMN "cnpj" SET NOT NULL;

-- AlterTable
ALTER TABLE "reservas" DROP COLUMN "clienteId",
DROP COLUMN "dataConfirmacao",
ADD COLUMN     "confirmadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "veiculos" ADD COLUMN     "observacoes" TEXT,
DROP COLUMN "tipo",
ADD COLUMN     "tipo" "TipoVeiculo" NOT NULL;

-- CreateTable
CREATE TABLE "escala_motoristas" (
    "escalaId" TEXT NOT NULL,
    "motoristaId" TEXT NOT NULL,
    "observacoes" TEXT,

    CONSTRAINT "escala_motoristas_pkey" PRIMARY KEY ("escalaId","motoristaId")
);

-- CreateTable
CREATE TABLE "escala_veiculos" (
    "escalaId" TEXT NOT NULL,
    "veiculoId" TEXT NOT NULL,
    "observacoes" TEXT,

    CONSTRAINT "escala_veiculos_pkey" PRIMARY KEY ("escalaId","veiculoId")
);

-- CreateTable
CREATE TABLE "escala_parceiros" (
    "escalaId" TEXT NOT NULL,
    "parceiroId" TEXT NOT NULL,
    "qtdVeiculos" INTEGER NOT NULL,
    "tipoVeiculo" "TipoVeiculo" NOT NULL,
    "valorRepasse" DECIMAL(10,2) NOT NULL,
    "observacoes" TEXT,

    CONSTRAINT "escala_parceiros_pkey" PRIMARY KEY ("escalaId","parceiroId")
);

-- CreateIndex
CREATE INDEX "atendimentos_dataServico_idx" ON "atendimentos"("dataServico");

-- CreateIndex
CREATE INDEX "atendimentos_criadoPor_idx" ON "atendimentos"("criadoPor");

-- CreateIndex
CREATE INDEX "atendimentos_canceladoPor_idx" ON "atendimentos"("canceladoPor");

-- CreateIndex
CREATE INDEX "contratos_atendimentoId_idx" ON "contratos"("atendimentoId");

-- CreateIndex
CREATE INDEX "contratos_geradoEm_idx" ON "contratos"("geradoEm");

-- CreateIndex
CREATE INDEX "contratos_geradoPor_idx" ON "contratos"("geradoPor");

-- AddForeignKey
ALTER TABLE "atendimentos" ADD CONSTRAINT "atendimentos_criadoPor_fkey" FOREIGN KEY ("criadoPor") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimentos" ADD CONSTRAINT "atendimentos_canceladoPor_fkey" FOREIGN KEY ("canceladoPor") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escala_motoristas" ADD CONSTRAINT "escala_motoristas_escalaId_fkey" FOREIGN KEY ("escalaId") REFERENCES "escala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escala_motoristas" ADD CONSTRAINT "escala_motoristas_motoristaId_fkey" FOREIGN KEY ("motoristaId") REFERENCES "motoristas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escala_veiculos" ADD CONSTRAINT "escala_veiculos_escalaId_fkey" FOREIGN KEY ("escalaId") REFERENCES "escala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escala_veiculos" ADD CONSTRAINT "escala_veiculos_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escala_parceiros" ADD CONSTRAINT "escala_parceiros_escalaId_fkey" FOREIGN KEY ("escalaId") REFERENCES "escala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escala_parceiros" ADD CONSTRAINT "escala_parceiros_parceiroId_fkey" FOREIGN KEY ("parceiroId") REFERENCES "parceiros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_geradoPor_fkey" FOREIGN KEY ("geradoPor") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
