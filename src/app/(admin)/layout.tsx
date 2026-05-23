import type { CSSProperties, ReactNode } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div style={estilos.layout}>
      <Sidebar />
      <div style={estilos.conteudo}>
        <Header />
        <main style={estilos.main}>{children}</main>
      </div>
    </div>
  );
}

const estilos: Record<string, CSSProperties> = {
  layout: {
    display: "flex",
    minHeight: "100vh",
  },
  conteudo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    backgroundColor: "#f5f5f5",
  },
  main: {
    flex: 1,
    overflow: "auto",
  },
};
