"use client";

import type { CSSProperties, FormEvent } from "react";
import { useState } from "react";
import type { Cliente } from "@prisma/client";
import { buscarEnderecoPorCep } from "@/lib/cep";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export type DadosClienteForm = {
  nome: string;
  cpfCnpj: string;
  rgIe?: string;
  telefone: string;
  email?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  ativo?: boolean;
};

type ClienteFormProps = {
  onSalvar: (dados: DadosClienteForm) => Promise<void> | void;
  onCancelar: () => void;
  initialData?: Cliente | null;
  salvando?: boolean;
  erroExterno?: string | null;
};

const estadoInicial: DadosClienteForm = {
  nome: "",
  cpfCnpj: "",
  rgIe: "",
  telefone: "",
  email: "",
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
  ativo: true,
};

function preencherInitialData(initialData?: Cliente | null): DadosClienteForm {
  if (!initialData) return estadoInicial;

  return {
    nome: initialData.nome ?? "",
    cpfCnpj: initialData.cpfCnpj ?? "",
    rgIe: initialData.rgIe ?? "",
    telefone: initialData.telefone ?? "",
    email: initialData.email ?? "",
    cep: initialData.cep ?? "",
    logradouro: initialData.logradouro ?? "",
    numero: initialData.numero ?? "",
    complemento: initialData.complemento ?? "",
    bairro: initialData.bairro ?? "",
    cidade: initialData.cidade ?? "",
    uf: initialData.uf ?? "",
    ativo: initialData.ativo,
  };
}

export default function ClienteForm({
  onSalvar,
  onCancelar,
  initialData,
  salvando = false,
  erroExterno,
}: ClienteFormProps) {
  const [dados, setDados] = useState<DadosClienteForm>(() =>
    preencherInitialData(initialData),
  );
  const [erro, setErro] = useState<string | null>(null);
  const [buscandoCep, setBuscandoCep] = useState(false);

  function atualizarCampo<K extends keyof DadosClienteForm>(
    campo: K,
    valor: DadosClienteForm[K],
  ) {
    setDados((atual) => ({ ...atual, [campo]: valor }));
  }

  async function buscarCep() {
    if (!dados.cep) {
      setErro("Informe um CEP para buscar o endereco.");
      return;
    }

    setErro(null);
    setBuscandoCep(true);

    try {
      const endereco = await buscarEnderecoPorCep(dados.cep);
      if (!endereco) {
        setErro("CEP nao encontrado ou invalido.");
        return;
      }

      setDados((atual) => ({
        ...atual,
        cep: endereco.cep,
        logradouro: endereco.logradouro,
        bairro: endereco.bairro,
        cidade: endereco.cidade,
        uf: endereco.uf,
      }));
    } catch {
      setErro("Nao foi possivel buscar o CEP agora.");
    } finally {
      setBuscandoCep(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);

    if (!dados.nome.trim() || !dados.cpfCnpj.trim() || !dados.telefone.trim()) {
      setErro("Nome, CPF/CNPJ e telefone sao obrigatorios.");
      return;
    }

    await onSalvar({
      ...dados,
      nome: dados.nome.trim(),
      cpfCnpj: dados.cpfCnpj.trim(),
      telefone: dados.telefone.trim(),
      rgIe: dados.rgIe?.trim() || undefined,
      email: dados.email?.trim() || undefined,
      cep: dados.cep?.trim() || undefined,
      logradouro: dados.logradouro?.trim() || undefined,
      numero: dados.numero?.trim() || undefined,
      complemento: dados.complemento?.trim() || undefined,
      bairro: dados.bairro?.trim() || undefined,
      cidade: dados.cidade?.trim() || undefined,
      uf: dados.uf?.trim() || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} style={estilos.formulario}>
      <div style={estilos.secao}>
        <h4 style={estilos.subtitulo}>Dados pessoais</h4>
        <div style={estilos.gridDoisCampos}>
          <Input
            label="Nome *"
            id="nome"
            value={dados.nome}
            onChange={(e) => atualizarCampo("nome", e.target.value)}
            required
            disabled={salvando}
          />
          <Input
            label="CPF/CNPJ *"
            id="cpfCnpj"
            value={dados.cpfCnpj}
            onChange={(e) => atualizarCampo("cpfCnpj", e.target.value)}
            required
            disabled={salvando}
          />
          <Input
            label="RG/IE"
            id="rgIe"
            value={dados.rgIe}
            onChange={(e) => atualizarCampo("rgIe", e.target.value)}
            disabled={salvando}
          />
          <Input
            label="Telefone *"
            id="telefone"
            value={dados.telefone}
            onChange={(e) => atualizarCampo("telefone", e.target.value)}
            required
            disabled={salvando}
          />
          <Input
            label="E-mail"
            id="email"
            type="email"
            value={dados.email}
            onChange={(e) => atualizarCampo("email", e.target.value)}
            disabled={salvando}
          />
        </div>
      </div>

      <div style={estilos.secao}>
        <h4 style={estilos.subtitulo}>Endereco</h4>
        <div style={estilos.linhaCep}>
          <Input
            label="CEP"
            id="cep"
            value={dados.cep}
            onChange={(e) => atualizarCampo("cep", e.target.value)}
            disabled={salvando || buscandoCep}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void buscarCep();
            }}
            disabled={salvando || buscandoCep}
          >
            {buscandoCep ? "Buscando..." : "Buscar CEP"}
          </Button>
        </div>

        <div style={estilos.gridDoisCampos}>
          <Input
            label="Logradouro"
            id="logradouro"
            value={dados.logradouro}
            onChange={(e) => atualizarCampo("logradouro", e.target.value)}
            disabled={salvando}
          />
          <Input
            label="Numero"
            id="numero"
            value={dados.numero}
            onChange={(e) => atualizarCampo("numero", e.target.value)}
            disabled={salvando}
          />
          <Input
            label="Complemento"
            id="complemento"
            value={dados.complemento}
            onChange={(e) => atualizarCampo("complemento", e.target.value)}
            disabled={salvando}
          />
          <Input
            label="Bairro"
            id="bairro"
            value={dados.bairro}
            onChange={(e) => atualizarCampo("bairro", e.target.value)}
            disabled={salvando}
          />
          <Input
            label="Cidade"
            id="cidade"
            value={dados.cidade}
            onChange={(e) => atualizarCampo("cidade", e.target.value)}
            disabled={salvando}
          />
          <Input
            label="UF"
            id="uf"
            value={dados.uf}
            onChange={(e) => atualizarCampo("uf", e.target.value)}
            disabled={salvando}
          />
        </div>
      </div>

      {(erro || erroExterno) && (
        <p style={estilos.erro}>{erro ?? erroExterno}</p>
      )}

      <div style={estilos.acoes}>
        <Button type="button" variant="secondary" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" disabled={salvando || buscandoCep}>
          {salvando ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}

const estilos: Record<string, CSSProperties> = {
  formulario: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  secao: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    padding: "0.75rem",
    border: "1px solid #e5e7eb",
    borderRadius: "0.5rem",
    backgroundColor: "#fafafa",
  },
  subtitulo: {
    fontSize: "0.95rem",
    color: "#374151",
  },
  gridDoisCampos: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "0.75rem",
  },
  linhaCep: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    alignItems: "end",
    gap: "0.75rem",
  },
  erro: {
    color: "#b91c1c",
    fontSize: "0.875rem",
  },
  acoes: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
  },
};
