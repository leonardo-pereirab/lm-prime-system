"use client";

import Link from "next/link";
import { Bell, Menu } from "lucide-react";
import { useMemo, useTransition } from "react";
import { usePathname } from "next/navigation";

import { logout } from "@/app/(admin)/_actions";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

type HeaderProps = {
  onAbrirSidebarMobile: () => void;
  usuario: {
    nome: string;
    email: string;
  };
};

const labelsRotas: Record<string, string> = {
  dashboard: "Inicio",
  atendimentos: "Atendimentos",
  clientes: "Clientes",
  contratos: "Contratos",
  cadastros: "Cadastros",
  motoristas: "Motoristas",
  novo: "Novo",
  veiculos: "Veiculos",
  parceiros: "Parceiros",
  reservas: "Reservas",
  orcamentos: "Orcamentos",
  escala: "Escala",
  usuarios: "Usuarios",
};

function formatarSegmento(segmento: string) {
  if (labelsRotas[segmento]) {
    return labelsRotas[segmento];
  }

  if (/^[a-z0-9]{10,}$/i.test(segmento)) {
    return "Detalhe";
  }

  return segmento.charAt(0).toUpperCase() + segmento.slice(1);
}

function construirBreadcrumb(pathname: string) {
  const segmentos = pathname.split("/").filter(Boolean);

  if (segmentos.length === 0) {
    return [{ label: "Inicio", href: "/dashboard" }];
  }

  return segmentos.map((segmento, index) => ({
    label: formatarSegmento(segmento),
    href: "/" + segmentos.slice(0, index + 1).join("/"),
  }));
}

function extrairIniciais(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("");
}

export default function Header({ onAbrirSidebarMobile, usuario }: HeaderProps) {
  const pathname = usePathname();
  const [saindo, iniciarLogout] = useTransition();
  const breadcrumb = useMemo(() => construirBreadcrumb(pathname), [pathname]);

  function handleLogout() {
    iniciarLogout(async () => {
      await logout();
    });
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onAbrirSidebarMobile}
          aria-label="Abrir menu de navegacao"
        >
          <Menu className="size-4" />
        </Button>

        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="flex items-center gap-2 text-sm text-neutral-500">
            {breadcrumb.map((item, index) => {
              const ultimo = index === breadcrumb.length - 1;

              return (
                <li
                  key={`${item.label}-${index}`}
                  className="flex items-center gap-2"
                >
                  {index > 0 ? <span>/</span> : null}
                  {ultimo ? (
                    <span className="font-medium text-neutral-900">
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      className="hover:text-neutral-700 hover:underline"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Notificacoes"
        >
          <Bell className="size-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" className="ml-1 h-9 px-2">
              <Avatar size="sm">
                <AvatarFallback>{extrairIniciais(usuario.nome)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 min-w-60">
            <DropdownMenuLabel className="space-y-0.5">
              <p className="truncate text-sm font-medium text-neutral-900">
                {usuario.nome}
              </p>
              <p className="truncate text-xs text-neutral-500">
                {usuario.email}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>Configuracoes</DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/politica-de-privacidade">
                Politica de privacidade
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} disabled={saindo}>
              {saindo ? "Saindo..." : "Sair"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
