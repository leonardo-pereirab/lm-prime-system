"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  FileText,
  Home,
  LayoutGrid,
  Users,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/Sheet";

type SidebarProps = {
  abertaMobile: boolean;
  onAbertaMobileChange: (aberta: boolean) => void;
};

type ItemNavegacao = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const itensPrincipais: ItemNavegacao[] = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/atendimentos", label: "Atendimentos", icon: LayoutGrid },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/contratos", label: "Contratos", icon: FileText },
];

const itensCadastros = [
  { href: "/cadastros/funcionarios", label: "Funcionarios" },
  { href: "/cadastros/motoristas", label: "Motoristas" },
  { href: "/cadastros/veiculos", label: "Veiculos" },
  { href: "/cadastros/parceiros", label: "Parceiros" },
];

function estaAtivo(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function ConteudoSidebar({
  pathname,
  onNavegar,
}: {
  pathname: string;
  onNavegar?: () => void;
}) {
  const cadastrosAtivo = useMemo(
    () => pathname.startsWith("/cadastros"),
    [pathname],
  );
  const [cadastrosAberto, setCadastrosAberto] = useState(cadastrosAtivo);

  useEffect(() => {
    if (cadastrosAtivo) {
      setCadastrosAberto(true);
    }
  }, [cadastrosAtivo]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-4">
        <p className="text-base font-semibold text-primary-700">LM Prime</p>
      </div>

      <nav
        className="flex-1 overflow-y-auto px-3 py-4"
        aria-label="Navegacao principal"
      >
        <ul className="space-y-1">
          {itensPrincipais.map((item) => {
            const Icone = item.icon;
            const ativo = estaAtivo(pathname, item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavegar}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    ativo
                      ? "bg-primary-100 text-primary-700"
                      : "text-neutral-700 hover:bg-neutral-100",
                  )}
                  aria-current={ativo ? "page" : undefined}
                >
                  <Icone className="size-4" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}

          <li>
            <button
              type="button"
              onClick={() => setCadastrosAberto((anterior) => !anterior)}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                cadastrosAtivo
                  ? "bg-primary-100 text-primary-700"
                  : "text-neutral-700 hover:bg-neutral-100",
              )}
              aria-expanded={cadastrosAberto}
              aria-controls="submenu-cadastros"
            >
              <span className="flex items-center gap-2">
                <Users className="size-4" />
                <span>Cadastros</span>
              </span>
              <ChevronDown
                className={cn(
                  "size-4 transition-transform",
                  cadastrosAberto && "rotate-180",
                )}
              />
            </button>
            <ul
              id="submenu-cadastros"
              className={cn(
                "mt-1 ml-6 space-y-1",
                !cadastrosAberto && "hidden",
              )}
            >
              {itensCadastros.map((item) => {
                const ativo = estaAtivo(pathname, item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavegar}
                      className={cn(
                        "block rounded-md px-3 py-2 text-sm transition-colors",
                        ativo
                          ? "bg-primary-100 text-primary-700"
                          : "text-neutral-600 hover:bg-neutral-100",
                      )}
                      aria-current={ativo ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default function Sidebar({
  abertaMobile,
  onAbertaMobileChange,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r bg-white lg:flex lg:flex-col">
        <ConteudoSidebar pathname={pathname} />
      </aside>

      <Sheet open={abertaMobile} onOpenChange={onAbertaMobileChange}>
        <SheetContent side="left" className="p-0 w-60" showCloseButton>
          <SheetTitle className="sr-only">Menu de navegacao</SheetTitle>
          <ConteudoSidebar
            pathname={pathname}
            onNavegar={() => onAbertaMobileChange(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
