"use client";

import type { CSSProperties } from "react";
import { use, useCallback, useEffect, useState } from "react";
import type { Cliente } from "@prisma/client";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ClienteForm, { type DadosClienteForm } from "@/components/forms/ClienteForm";
import { formatDocument } from "@/utils/formatDocument";
import { formatDate } from "@/utils/formatDate";

type PageProps = { params: Promise<{ id: string }> };

async function parseErroResposta(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { erro?: string; error?: string };
    return body.erro ?? body.error ?? "Erro inesperado na operacao.";
  } catch {
    return "Erro inesperado na operacao.";
  }
}

export default function ClienteDetalhe({ params }: PageProps) {
  const { id } = use(params);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  const carregarCliente = useCallback(async () => {
    setLoading(true);
    setErro(null);

    try {
      const resposta = await fetch(`/api/clientes/${id}`);
      if (!resposta.ok) {
        throw new Error(await parseErroResposta(resposta));
      }

      const dados = (await resposta.json()) as Cliente;
      setCliente(dados);
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro ao carregar cliente.");
      setCliente(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void carregarCliente();
  }, [carregarCliente]);

  async function atualizarCliente(dados: Partial<DadosClienteForm>) {
    setSalvando(true);
    setErro(null);

    try {
      const resposta = await fetch(`/api/clientes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });

      if (!resposta.ok) {
        throw new Error(await parseErroResposta(resposta));
      }

      await carregarCliente();
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro ao atualizar cliente.");
      throw err;
    } finally {
      setSalvando(false);
    }
  }

  async function handleSalvar(dados: DadosClienteForm) {
    await atualizarCliente(dados);
    setModalAberto(false);
  }

  async function handleAlternarStatus() {
    if (!cliente) return;

    const acao = cliente.ativo ? "desativar" : "reativar";
    const confirmou = window.confirm(
      `Deseja realmente ${acao} este cliente?`,
    );

    if (!confirmou) return;

    await atualizarCliente({ ativo: !cliente.ativo });
  }

  if (loading) {
    return <main style={estilos.container}>Carregando cliente...</main>;
  }

  if (!cliente) {
    return (
      <main style={estilos.container}>
        <p style={estilos.erro}>{erro ?? "Cliente nao encontrado."}</p>
        <Link href="/clientes" style={estilos.link}>
          Voltar para clientes
        </Link>
      </main>
    );
  }

  return (
    <main style={estilos.container}>
      <nav style={estilos.breadcrumb}>
        <Link href="/clientes" style={estilos.link}>
          Clientes
        </Link>
        <span>{" > "}</span>
        <span>{cliente.nome}</span>
      </nav>

      <header style={estilos.cabecalho}>
        <h1 style={estilos.titulo}>{cliente.nome}</h1>
        <div style={estilos.acoes}>
          <Badge
            status={cliente.ativo ? "ativo" : "inativo"}
            label={cliente.ativo ? "Ativo" : "Inativo"}
          />
          <Button variant="secondary" onClick={() => setModalAberto(true)}>
            Editar
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              void handleAlternarStatus();
            }}
          >
            {cliente.ativo ? "Desativar" : "Reativar"}
          </Button>
        </div>
      </header>

      {erro && <p style={estilos.erro}>{erro}</p>}

      <section style={estilos.card}>
        <h2 style={estilos.subtitulo}>Dados pessoais</h2>
        <div style={estilos.gridDoisCampos}>
          <p>
            <strong>CPF/CNPJ:</strong> {formatDocument(cliente.cpfCnpj)}
          </p>
          <p>
            <strong>RG/IE:</strong> {cliente.rgIe ?? "-"}
          </p>
          <p>
            <strong>Telefone:</strong> {cliente.telefone}
          </p>
          <p>
            <strong>E-mail:</strong> {cliente.email ?? "-"}
          </p>
          <p>
            <strong>Criado em:</strong> {formatDate(cliente.createdAt)}
          </p>
          <p>
            <strong>Atualizado em:</strong> {formatDate(cliente.updatedAt)}
          </p>
        </div>
      </section>

      <section style={estilos.card}>
        <h2 style={estilos.subtitulo}>Endereco</h2>
        <div style={estilos.gridDoisCampos}>
          <p>
            <strong>CEP:</strong> {cliente.cep ?? "-"}
          </p>
          <p>
            <strong>Logradouro:</strong> {cliente.logradouro ?? "-"}
          </p>
          <p>
            <strong>Numero:</strong> {cliente.numero ?? "-"}
          </p>
          <p>
            <strong>Complemento:</strong> {cliente.complemento ?? "-"}
          </p>
          <p>
            <strong>Bairro:</strong> {cliente.bairro ?? "-"}
          </p>
          <p>
            <strong>Cidade/UF:</strong>{" "}
            {cliente.cidade ? `${cliente.cidade}/${cliente.uf ?? ""}` : "-"}
          </p>
        </div>
      </section>

      <section style={estilos.card}>
        <h2 style={estilos.subtitulo}>Atendimentos</h2>
        <p style={estilos.info}>
          O historico de atendimentos vinculados sera exibido nesta secao em uma
          proxima iteracao.
        </p>
      </section>

      <Modal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        title="Editar cliente"
      >
        <ClienteForm
          initialData={cliente}
          onSalvar={handleSalvar}
          onCancelar={() => setModalAberto(false)}
          salvando={salvando}
        />
      </Modal>
    </main>
  );
}

const estilos: Record<string, CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    padding: "1rem",
  },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    fontSize: "0.9rem",
    color: "#4b5563",
  },
  link: {
    color: "#1d4ed8",
    textDecoration: "none",
  },
  cabecalho: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  titulo: {
    fontSize: "1.5rem",
    color: "#111827",
  },
  acoes: {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
    flexWrap: "wrap",
  },
  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "0.5rem",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  subtitulo: {
    fontSize: "1rem",
    color: "#1f2937",
  },
  gridDoisCampos: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "0.75rem",
  },
  erro: {
    color: "#b91c1c",
  },
  info: {
    color: "#374151",
  },
};
