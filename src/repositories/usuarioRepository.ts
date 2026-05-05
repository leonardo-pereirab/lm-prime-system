import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const usuarioRepository = {
  async findAll() {
    return prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        ativo: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { nome: "asc" },
    });
  },

  async findById(id: string) {
    return prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        ativo: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async findByEmail(email: string) {
    return prisma.usuario.findUnique({ where: { email } });
  },

  async create(dados: Prisma.UsuarioUncheckedCreateInput) {
    return prisma.usuario.create({ data: dados });
  },

  async update(id: string, dados: Prisma.UsuarioUncheckedUpdateInput) {
    return prisma.usuario.update({ where: { id }, data: dados });
  },

  async delete(id: string) {
    return prisma.usuario.delete({ where: { id } });
  },
};
