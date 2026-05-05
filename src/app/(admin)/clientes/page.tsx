"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import type { Cliente } from "@prisma/client";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import ClienteForm, { type DadosClienteForm } from "@/components/forms/ClienteForm";
import { useClientes } from "@/hooks/useClientes";
import { formatDocument } from "@/utils/formatDocument";

export default function ClientesPage() {
  const router = useRouter();
  const { clientes, loading, error, erroCrud, salvando, criar, atualizar, desativar, reativar } =
    useClientes();
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [erroFormulario, setErroFormulario] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  const clientesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return clientes;

    return clientes.filter((cliente) => {
      const nome = cliente.nome.toLowerCase();
      const documento = cliente.cpfCnpj.toLowerCase();
      return nome.includes(termo) || documento.includes(termo);
    });
  }, [busca, clientes]);

  function abrirNovoCliente() {
    setMensagemSucesso(null);
    setErroFormulario(null);
    setClienteSelecionado(null);
    setModalAberto(true);
  }

  function abrirEdicao(cliente: Cliente) {
    setMensagemSucesso(null);
    setErroFormulario(null);
    setClienteSelecionado(cliente);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setClienteSelecionado(null);
    setErroFormulario(null);
  }

  async function handleSalvar(dados: DadosClienteForm) {
    try {
      if (clienteSelecionado) {
        await atualizar(clienteSelecionado.id, dados);
        setMensagemSucesso("Cliente atualizado com sucesso.");
      } else {
        await criar(dados);
        setMensagemSucesso("Cliente cadastrado com sucesso.");
        setBusca("");
      }

      fecharModal();
    } catch (err: unknown) {
      setErroFormulario(
        err instanceof Error ? err.message : "Erro ao salvar cliente.",
      );
    }
  }

  async function handleAlternarStatus(cliente: Cliente) {
    const acao = cliente.ativo ? "desativar" : "reativar";
    const confirmou = window.confirm(
      `Deseja realmente ${acao} este cliente?`,
    );

    if (!confirmou) return;

    try {
      if (cliente.ativo) {
        await desativar(cliente.id);
        setMensagemSucesso("Cliente desativado com sucesso.");
      } else {
        await reativar(cliente.id);
        setMensagemSucesso("Cliente reativado com sucesso.");
      }
    } catch {
      setErroFormulario("Nao foi possivel atualizar o status do cliente.");
    }
  }

  return (
    <div style={estilos.container}>
      <PageHeader title="Clientes">
        <Button onClick={abrirNovoCliente}>Novo cliente</Button>
      </PageHeader>

      <div style={estilos.filtros}>
        <Input
          id="busca-clientes"
          label="Buscar por nome ou CPF/CNPJ"
          placeholder="Digite para filtrar"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {(error || erroCrud || erroFormulario) && (
        <p style={estilos.erro}>{error ?? erroCrud ?? erroFormulario}</p>
      )}

      {mensagemSucesso && <p style={estilos.sucesso}>{mensagemSucesso}</p>}

      {loading ? (
        <p style={estilos.info}>Carregando clientes...</p>
      ) : clientesFiltrados.length === 0 ? (
        <p style={estilos.info}>Nenhum cliente encontrado.</p>
      ) : (
        <div style={estilos.tabelaWrapper}>
          <table style={estilos.tabela}>
            <thead>
              <tr>
                <th style={estilos.cabecalho}>Nome</th>
                <th style={estilos.cabecalho}>CPF/CNPJ</th>
                <th style={estilos.cabecalho}>Telefone</th>
                <th style={estilos.cabecalho}>E-mail</th>
                <th style={estilos.cabecalho}>Cidade/UF</th>
                <th style={estilos.cabecalho}>Status</th>
                <th style={estilos.cabecalho}>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((cliente) => (
                <tr key={cliente.id}>
                  <td style={estilos.celula}>{cliente.nome}</td>
                  <td style={estilos.celula}>{formatDocument(cliente.cpfCnpj)}</td>
                  <td style={estilos.celula}>{cliente.telefone}</td>
                  <td style={estilos.celula}>{cliente.email ?? "-"}</td>
                  <td style={estilos.celula}>
                    {cliente.cidade ? `${cliente.cidade}/${cliente.uf ?? ""}` : "-"}
                  </td>
                  <td style={estilos.celula}>
                    <Badge
                      status={cliente.ativo ? "ativo" : "inativo"}
                      label={cliente.ativo ? "Ativo" : "Inativo"}
                    />
                  </td>
                  <td style={estilos.celula}>
                    <div style={estilos.acoesLinha}>
                      <Button
                        variant="secondary"
                        onClick={() => router.push(`/clientes/${cliente.id}`)}
                      >
                        Ver
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => abrirEdicao(cliente)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          void handleAlternarStatus(cliente);
                        }}
                      >
                        {cliente.ativo ? "Desativar" : "Reativar"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modalAberto}
        onClose={fecharModal}
        title={clienteSelecionado ? "Editar cliente" : "Novo cliente"}
      >
        <ClienteForm
          initialData={clienteSelecionado}
          onSalvar={handleSalvar}
          onCancelar={fecharModal}
          salvando={salvando}
          erroExterno={erroFormulario}
        />
      </Modal>
    </div>
  );
}

const estilos: Record<string, CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    padding: "1rem",
  },
  filtros: {
    maxWidth: "420px",
  },
  erro: {
    color: "#b91c1c",
    fontSize: "0.9rem",
  },
  sucesso: {
    color: "#166534",
    fontSize: "0.9rem",
  },
  info: {
    color: "#374151",
  },
  tabelaWrapper: {
    width: "100%",
    overflowX: "auto",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "0.5rem",
  },
  tabela: {
    width: "100%",
    borderCollapse: "collapse",
  },
  cabecalho: {
    textAlign: "left",
    padding: "0.75rem",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "0.85rem",
    color: "#4b5563",
  },
  celula: {
    padding: "0.75rem",
    borderBottom: "1px solid #f3f4f6",
    verticalAlign: "middle",
    fontSize: "0.9rem",
  },
  acoesLinha: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
  },
};
