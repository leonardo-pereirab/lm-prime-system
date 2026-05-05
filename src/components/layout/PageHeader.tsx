import type { CSSProperties, ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  children?: ReactNode;
};

export default function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div style={estilos.container}>
      <h1 style={estilos.titulo}>{title}</h1>
      {children && <div style={estilos.acoes}>{children}</div>}
    </div>
  );
}

const estilos: Record<string, CSSProperties> = {
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "1rem",
    borderBottom: "1px solid #e5e7eb",
    gap: "1rem",
    flexWrap: "wrap",
  },
  titulo: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#111827",
  },
  acoes: {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
  },
};
