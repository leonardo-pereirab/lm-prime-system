"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/atendimentos", label: "Atendimentos" },
  { href: "/clientes", label: "Clientes" },
  { href: "/escala", label: "Escala" },
  { href: "/contratos", label: "Contratos" },
  { href: "/cadastros/motoristas", label: "Motoristas" },
  { href: "/cadastros/veiculos", label: "Veiculos" },
  { href: "/cadastros/parceiros", label: "Parceiros" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={estilos.aside}>
      <div style={estilos.logoArea}>
        <span style={estilos.logoTexto}>LM Prime</span>
      </div>
      <nav>
        <ul style={estilos.lista}>
          {links.map((link) => {
            const ativo =
              pathname === link.href ||
              pathname.startsWith(link.href + "/");

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  style={ativo ? { ...estilos.link, ...estilos.linkAtivo } : estilos.link}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

const estilos: Record<string, CSSProperties> = {
  aside: {
    width: "220px",
    minHeight: "100vh",
    backgroundColor: "#1e293b",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
  },
  logoArea: {
    padding: "1.25rem 1rem",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  logoTexto: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#f8fafc",
    letterSpacing: "0.02em",
  },
  lista: {
    listStyle: "none",
    padding: "0.5rem 0",
  },
  link: {
    display: "block",
    padding: "0.625rem 1rem",
    fontSize: "0.9rem",
    color: "#94a3b8",
    textDecoration: "none",
  },
  linkAtivo: {
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "#f8fafc",
    fontWeight: 600,
    borderLeft: "3px solid #3b82f6",
  },
};
