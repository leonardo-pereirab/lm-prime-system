import { NextResponse, type NextRequest } from "next/server";
import { verificarToken } from "@/lib/auth";

const rotasPublicasExatas = ["/login"];
const rotasPublicasPrefixo = ["/api/auth", "/api/cep", "/api/cron/"];

const rotasProtegidas = [
  "/dashboard",
  "/atendimentos",
  "/clientes",
  "/escala",
  "/contratos",
  "/cadastros",
];

function eRotaPublica(pathname: string) {
  if (rotasPublicasExatas.includes(pathname)) {
    return true;
  }

  return rotasPublicasPrefixo.some((rota) => pathname.startsWith(rota));
}

function redirecionarParaLogin(request: NextRequest) {
  const destino = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const url = new URL("/login", request.url);

  if (destino && destino !== "/login") {
    url.searchParams.set("next", destino);
  }

  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (eRotaPublica(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const eRotaProtegida = rotasProtegidas.some((rota) =>
    pathname.startsWith(rota),
  );
  if (!eRotaProtegida) return NextResponse.next();

  const token = request.cookies.get("token")?.value;

  if (!token) {
    return redirecionarParaLogin(request);
  }

  try {
    await verificarToken(token);
    return NextResponse.next();
  } catch {
    return redirecionarParaLogin(request);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
