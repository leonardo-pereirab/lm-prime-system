import type { CSSProperties } from "react";

export default function Header() {
  return (
    <header style={estilos.header}>
      <span style={estilos.sistema}>Sistema de Gestão</span>
    </header>
  );
}

const estilos: Record<string, CSSProperties> = {
  header: {
    height: "56px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    padding: "0 1.25rem",
    flexShrink: 0,
  },
  sistema: {
    fontSize: "0.9rem",
    color: "#6b7280",
    fontWeight: 500,
  },
};
