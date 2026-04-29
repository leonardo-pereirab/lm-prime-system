import type { Prisma } from "@prisma/client";
import { usuarioRepository } from "@/repositories/usuarioRepository";

export const usuarioService = {
  async listarTodos() {
    return usuarioRepository.findAll();
  },

  async buscarPorId(id: string) {
    return usuarioRepository.findById(id);
  },

  async criar(dados: Prisma.UsuarioUncheckedCreateInput) {
    return usuarioRepository.create(dados);
  },

  async atualizar(id: string, dados: Prisma.UsuarioUncheckedUpdateInput) {
    const { senha, ...resto } = dados;
    void senha;
    return usuarioRepository.update(id, resto);
  },

  async deletar(id: string) {
    return usuarioRepository.delete(id);
  },
};
