import type { CSSProperties } from "react";
import LoginForm from "@/components/forms/LoginForm";

export const metadata = {
  title: "Login — LM Prime System",
};

export default function LoginPage() {
  return (
    <main style={estilos.pagina}>
      <div style={estilos.cartao}>
        <div style={estilos.cabecalho}>
          <h1 style={estilos.titulo}>LM Prime System</h1>
          <p style={estilos.subtitulo}>Faca login para acessar o sistema</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}

const estilos: Record<string, CSSProperties> = {
  pagina: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    padding: "1rem",
  },
  cartao: {
    backgroundColor: "#ffffff",
    borderRadius: "1rem",
    boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
    padding: "2.5rem 2rem",
    width: "100%",
    maxWidth: "400px",
  },
  cabecalho: {
    textAlign: "center",
    marginBottom: "2rem",
  },
  titulo: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#1d4ed8",
    marginBottom: "0.375rem",
  },
  subtitulo: {
    fontSize: "0.9rem",
    color: "#6b7280",
  },
};
