import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const databaseUrlTeste =
  process.env.NODE_ENV === "test"
    ? (process.env.DATABASE_URL_TEST ?? process.env.DATABASE_URL)
    : undefined;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
    ...(databaseUrlTeste && {
      datasources: {
        db: {
          url: databaseUrlTeste,
        },
      },
    }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
