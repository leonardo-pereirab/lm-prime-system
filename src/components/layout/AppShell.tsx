"use client";

import { useState, type ReactNode } from "react";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

type AppShellProps = {
  children: ReactNode;
  usuario: {
    nome: string;
    email: string;
  };
};

export default function AppShell({ children, usuario }: AppShellProps) {
  const [sidebarMobileAberta, setSidebarMobileAberta] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Sidebar
        abertaMobile={sidebarMobileAberta}
        onAbertaMobileChange={setSidebarMobileAberta}
      />

      <div className="min-h-screen lg:pl-60">
        <Header
          usuario={usuario}
          onAbrirSidebarMobile={() => setSidebarMobileAberta(true)}
        />
        <main>
          <div className="mx-auto w-full max-w-7xl px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
