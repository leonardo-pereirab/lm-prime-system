"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={estilos.overlay}
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={estilos.caixa}>
        <div style={estilos.cabecalho}>
          <h2 style={estilos.titulo}>{title}</h2>
          <button
            style={estilos.botaoFechar}
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
        <div style={estilos.conteudo}>{children}</div>
      </div>
    </div>
  );
}

const estilos: Record<string, CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    padding: "1rem",
  },
  caixa: {
    backgroundColor: "#ffffff",
    borderRadius: "0.75rem",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
    width: "100%",
    maxWidth: "720px",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  cabecalho: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 1.25rem",
    borderBottom: "1px solid #e5e7eb",
    flexShrink: 0,
  },
  titulo: {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#111827",
  },
  botaoFechar: {
    background: "none",
    border: "none",
    fontSize: "1rem",
    cursor: "pointer",
    color: "#6b7280",
    lineHeight: 1,
    padding: "0.25rem 0.5rem",
    borderRadius: "0.25rem",
    fontFamily: "inherit",
  },
  conteudo: {
    padding: "1.25rem",
    overflowY: "auto",
    flex: 1,
  },
};
