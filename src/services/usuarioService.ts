import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "@/domain/errors";
import { hashSenha, verificarSenha } from "@/lib/auth";
import type { UsuarioFiltros } from "@/repositories/usuarioRepository";
import { usuarioRepository } from "@/repositories/usuarioRepository";
import type { UsuarioInput, UsuarioUpdate } from "@/schemas/usuario";
import type { Prisma } from "@prisma/client";

export const usuarioService = {
  async listar(filtros: UsuarioFiltros = {}) {
    return usuarioRepository.listar(filtros);
  },

  async buscarPorId(id: string) {
    const usuario = await usuarioRepository.buscarPorId(id);
    if (!usuario) {
      throw new NotFoundError(
        "USUARIO_NAO_ENCONTRADO",
        "Usuário não encontrado.",
      );
    }

    return usuario;
  },

  async autenticar(email: string, senha: string) {
    const usuario = await usuarioRepository.buscarComSenhaPorEmail(email);

    if (!usuario) {
      throw new UnauthorizedError(
        "CREDENCIAIS_INVALIDAS",
        "Credenciais inválidas.",
      );
    }

    if (!usuario.ativo) {
      throw new UnauthorizedError(
        "CONTA_INATIVA",
        "Conta inativa. Contate um gerente para reativacao.",
      );
    }

    const senhaValida = await verificarSenha(senha, usuario.senha);

    if (!senhaValida) {
      throw new UnauthorizedError(
        "CREDENCIAIS_INVALIDAS",
        "Credenciais inválidas.",
      );
    }

    if (!usuario.funcionario) {
      throw new UnauthorizedError(
        "ACESSO_BLOQUEADO",
        "Conta indisponivel para acesso.",
      );
    }

    if (usuario.funcionario.estado !== "ATIVO") {
      throw new UnauthorizedError(
        "CONTA_INATIVA",
        "Conta inativa. Contate um gerente para reativacao.",
      );
    }

    return {
      id: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil,
    };
  },

  async criar(dados: UsuarioInput | Prisma.UsuarioUncheckedCreateInput) {
    const senha = await hashSenha(dados.senha);
    return usuarioRepository.criar({ ...dados, senha });
  },

  async atualizar(
    id: string,
    dados: UsuarioUpdate | Prisma.UsuarioUncheckedUpdateInput,
  ) {
    await this.buscarPorId(id);

    const payload = { ...dados } as
      | UsuarioUpdate
      | Prisma.UsuarioUncheckedUpdateInput;
    if (typeof payload.senha === "string") {
      payload.senha = await hashSenha(payload.senha);
    }

    return usuarioRepository.atualizar(id, payload);
  },

  async listarTodos() {
    return this.listar();
  },

  async desativar(id: string) {
    await this.buscarPorId(id);
    return usuarioRepository.desativar(id);
  },

  async excluir(id: string) {
    await this.buscarPorId(id);
    const totalVinculos = await usuarioRepository.contarVinculos(id);

    if (totalVinculos > 0) {
      throw new ConflictError(
        "EM_USO",
        "Usuário possui registros vinculados e não pode ser excluído.",
      );
    }

    return usuarioRepository.excluir(id);
  },

  async deletar(id: string) {
    return this.excluir(id);
  },
};
