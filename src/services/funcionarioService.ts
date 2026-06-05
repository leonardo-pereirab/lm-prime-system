import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/domain/errors";
import { apenasDigitos } from "@/domain/helpers";
import { hashSenha } from "@/lib/auth";
import type {
  FuncionarioFiltros,
  FuncionarioOrdenacao,
} from "@/repositories/funcionarioRepository";
import { funcionarioRepository } from "@/repositories/funcionarioRepository";
import { prisma } from "@/lib/prisma";
import type {
  FuncionarioInput,
  FuncionarioUpdate,
} from "@/schemas/funcionario";
import type { AtivacaoConclusaoInput } from "@/schemas/auth";
import type { ClassificacaoFuncionario, PerfilUsuario } from "@prisma/client";
import { Prisma } from "@prisma/client";

function perfilPorClassificacao(
  classificacao: ClassificacaoFuncionario,
): PerfilUsuario {
  return classificacao === "GERENTE" ? "ADMIN" : "ATENDENTE";
}

function gerarCpfAnonimizado(base: string): string {
  const seed = [...base].reduce((acc, char) => {
    return (acc * 31 + char.charCodeAt(0)) % 1_000_000_000;
  }, 7);

  return String(10_000_000_000 + seed).slice(-11);
}

function proximaMatricula(sequencia: number): string {
  return `FUN-${String(sequencia).padStart(5, "0")}`;
}

export const funcionarioService = {
  async listarPaginado(
    filtros: FuncionarioFiltros = {},
    ordenacao: FuncionarioOrdenacao = "NOME_ASC",
  ) {
    const { pagina = 1, tamanho = 20, ...restante } = filtros;

    const [itens, total] = await Promise.all([
      funcionarioRepository.listar({ ...restante, pagina, tamanho }, ordenacao),
      funcionarioRepository.contar(restante),
    ]);

    return {
      itens,
      total,
      pagina,
      tamanho,
      totalPaginas: Math.max(1, Math.ceil(total / tamanho)),
    };
  },

  async buscarPorId(id: string) {
    const funcionario = await funcionarioRepository.buscarPorId(id);

    if (!funcionario) {
      throw new NotFoundError(
        "FUNCIONARIO_NAO_ENCONTRADO",
        "Funcionario nao encontrado.",
      );
    }

    return funcionario;
  },

  async criarConvidado(dados: FuncionarioInput) {
    const cpf = apenasDigitos(dados.cpf);
    const telefonePrincipal = apenasDigitos(dados.telefonePrincipal);
    const cep = apenasDigitos(dados.cep);

    if (cpf.length !== 11) {
      throw new ValidationError("CPF_INVALIDO", "CPF deve conter 11 digitos.");
    }

    let tentativa = 0;
    while (tentativa < 8) {
      tentativa += 1;

      const totalExistente = await funcionarioRepository.contar({});
      const matricula = proximaMatricula(totalExistente + tentativa);

      try {
        return await funcionarioRepository.criar({
          estado: "CONVIDADO",
          classificacao: dados.classificacao,
          matricula,
          nomeCompleto: dados.nomeCompleto,
          emailCorporativo: dados.emailCorporativo,
          cpf,
          telefonePrincipal,
          cep,
          logradouro: dados.logradouro,
          numero: dados.numero,
          complemento: dados.complemento,
          bairro: dados.bairro,
          cidade: dados.cidade,
          estadoUf: dados.estadoUf.toUpperCase(),
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          continue;
        }

        throw error;
      }
    }

    throw new ConflictError(
      "MATRICULA_NAO_GERADA",
      "Nao foi possivel gerar matricula unica para o funcionario.",
    );
  },

  async atualizarDadosCriticos(id: string, dados: FuncionarioUpdate) {
    const atual = await this.buscarPorId(id);

    if (atual.anonimizadoEm) {
      throw new ConflictError(
        "FUNCIONARIO_ANONIMIZADO",
        "Funcionario anonimizado nao pode ter dados criticos alterados.",
      );
    }

    const payload: Prisma.FuncionarioUpdateInput = {
      ...(dados.nomeCompleto && { nomeCompleto: dados.nomeCompleto }),
      ...(dados.emailCorporativo && {
        emailCorporativo: dados.emailCorporativo,
      }),
      ...(dados.cpf && { cpf: apenasDigitos(dados.cpf) }),
      ...(dados.telefonePrincipal && {
        telefonePrincipal: apenasDigitos(dados.telefonePrincipal),
      }),
      ...(dados.classificacao && { classificacao: dados.classificacao }),
      ...(dados.cep && { cep: apenasDigitos(dados.cep) }),
      ...(dados.logradouro && { logradouro: dados.logradouro }),
      ...(dados.numero && { numero: dados.numero }),
      ...(dados.complemento !== undefined && {
        complemento: dados.complemento,
      }),
      ...(dados.bairro && { bairro: dados.bairro }),
      ...(dados.cidade && { cidade: dados.cidade }),
      ...(dados.estadoUf && { estadoUf: dados.estadoUf.toUpperCase() }),
    };

    return funcionarioRepository.atualizar(id, payload);
  },

  async validarAtivacao(email: string, matricula: string) {
    const funcionario =
      await funcionarioRepository.buscarConvidadoPorEmailEMatricula(
        email,
        matricula,
      );

    if (!funcionario) {
      throw new UnauthorizedError(
        "ATIVACAO_INVALIDA",
        "Dados nao reconhecidos. Insira dados ja autorizados pela empresa.",
      );
    }

    return {
      id: funcionario.id,
      matricula: funcionario.matricula,
      nomeCompleto: funcionario.nomeCompleto,
      emailCorporativo: funcionario.emailCorporativo,
      cpf: funcionario.cpf,
      telefonePrincipal: funcionario.telefonePrincipal,
      cep: funcionario.cep,
      logradouro: funcionario.logradouro,
      numero: funcionario.numero,
      complemento: funcionario.complemento,
      bairro: funcionario.bairro,
      cidade: funcionario.cidade,
      estadoUf: funcionario.estadoUf,
      classificacao: funcionario.classificacao,
    };
  },

  async concluirPrimeiroAcesso(input: AtivacaoConclusaoInput) {
    const funcionario =
      await funcionarioRepository.buscarConvidadoPorEmailEMatricula(
        input.email,
        input.matricula,
      );

    if (!funcionario) {
      throw new UnauthorizedError(
        "ATIVACAO_INVALIDA",
        "Nao foi possivel concluir a ativacao da conta.",
      );
    }

    if (funcionario.usuarioId) {
      throw new ConflictError(
        "USUARIO_JA_VINCULADO",
        "Funcionario ja possui credencial vinculada.",
      );
    }

    const senhaHash = await hashSenha(input.senha);
    const telefoneAdicional = input.telefoneAdicional
      ? apenasDigitos(input.telefoneAdicional)
      : undefined;

    return prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: {
          nome: funcionario.nomeCompleto,
          email: funcionario.emailCorporativo,
          senha: senhaHash,
          ativo: true,
          perfil: perfilPorClassificacao(funcionario.classificacao),
        },
      });

      const atualizado = await tx.funcionario.update({
        where: { id: funcionario.id },
        data: {
          usuarioId: usuario.id,
          estado: "ATIVO",
          telefoneAdicional,
          aceitouTermosEm: new Date(),
          versaoTermosAceita: input.versaoTermosAceita,
        },
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
              perfil: true,
              ativo: true,
            },
          },
        },
      });

      return atualizado;
    });
  },

  async ativar(id: string) {
    const funcionario = await this.buscarPorId(id);

    if (!funcionario.usuarioId) {
      throw new ValidationError(
        "ATIVACAO_PENDENTE",
        "Funcionario sem credencial vinculada deve concluir o primeiro acesso.",
      );
    }

    const perfil = perfilPorClassificacao(funcionario.classificacao);

    return prisma.$transaction(async (tx) => {
      await tx.usuario.update({
        where: { id: funcionario.usuarioId as string },
        data: {
          ativo: true,
          perfil,
          nome: funcionario.nomeCompleto,
          email: funcionario.emailCorporativo,
        },
      });

      return tx.funcionario.update({
        where: { id },
        data: { estado: "ATIVO" },
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
              perfil: true,
              ativo: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });
    });
  },

  async inativar(id: string) {
    const funcionario = await this.buscarPorId(id);

    return prisma.$transaction(async (tx) => {
      if (funcionario.usuarioId) {
        await tx.usuario.update({
          where: { id: funcionario.usuarioId },
          data: { ativo: false },
        });
      }

      return tx.funcionario.update({
        where: { id },
        data: { estado: "INATIVO" },
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
              perfil: true,
              ativo: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });
    });
  },

  async excluirOuAnonimizar(id: string) {
    const funcionario = await this.buscarPorId(id);

    if (funcionario.estado === "CONVIDADO" && !funcionario.usuarioId) {
      await funcionarioRepository.excluir(id);
      return { modo: "EXCLUIDO" as const };
    }

    const emailAnonimo = `anonimo+${funcionario.id}@anonimo.local`;
    const cpfAnonimo = gerarCpfAnonimizado(funcionario.id);

    await prisma.$transaction(async (tx) => {
      if (funcionario.usuarioId) {
        await tx.usuario.update({
          where: { id: funcionario.usuarioId },
          data: {
            ativo: false,
            email: emailAnonimo,
            nome: `Usuario removido ${funcionario.matricula}`,
          },
        });
      }

      await tx.funcionario.update({
        where: { id },
        data: {
          estado: "INATIVO",
          nomeCompleto: `Funcionario removido ${funcionario.matricula}`,
          emailCorporativo: emailAnonimo,
          cpf: cpfAnonimo,
          telefonePrincipal: "0000000000",
          telefoneAdicional: null,
          cep: "00000000",
          logradouro: "Nao informado",
          numero: "S/N",
          complemento: null,
          bairro: "Nao informado",
          cidade: "Nao informado",
          estadoUf: "SP",
          anonimizadoEm: new Date(),
        },
      });
    });

    return { modo: "ANONIMIZADO" as const };
  },
};
