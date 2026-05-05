"use client";

import type { CSSProperties, FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const resposta = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const dados = (await resposta.json()) as { erro?: string };

      if (!resposta.ok) {
        setErro(dados.erro ?? "Erro ao realizar login.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setErro("Erro de conexao. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={estilos.formulario}>
      <div style={estilos.campo}>
        <label htmlFor="email" style={estilos.rotulo}>
          E-mail
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          required
          style={estilos.input}
          disabled={carregando}
        />
      </div>

      <div style={estilos.campo}>
        <label htmlFor="senha" style={estilos.rotulo}>
          Senha
        </label>
        <input
          id="senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="••••••••"
          required
          style={estilos.input}
          disabled={carregando}
        />
      </div>

      {erro && <p style={estilos.erro}>{erro}</p>}

      <button type="submit" style={estilos.botao} disabled={carregando}>
        {carregando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}

const estilos: Record<string, CSSProperties> = {
  formulario: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    width: "100%",
  },
  campo: {
    display: "flex",
    flexDirection: "column",
    gap: "0.375rem",
  },
  rotulo: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#374151",
  },
  input: {
    padding: "0.625rem 0.875rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    outline: "none",
    transition: "border-color 0.15s",
    backgroundColor: "#fff",
    color: "#1a1a1a",
  },
  erro: {
    fontSize: "0.875rem",
    color: "#dc2626",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "0.375rem",
    padding: "0.5rem 0.75rem",
  },
  botao: {
    marginTop: "0.5rem",
    padding: "0.75rem",
    backgroundColor: "#1d4ed8",
    color: "#fff",
    border: "none",
    borderRadius: "0.5rem",
    fontSize: "0.9375rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.15s",
  },
};
