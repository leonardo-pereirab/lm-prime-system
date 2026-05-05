import { NextResponse, type NextRequest } from "next/server";
import { verificarToken } from "@/lib/auth";

const rotasProtegidas = [
  "/dashboard",
  "/atendimentos",
  "/clientes",
  "/escala",
  "/contratos",
  "/cadastros",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const eRotaProtegida = rotasProtegidas.some((rota) =>
    pathname.startsWith(rota),
  );
  if (!eRotaProtegida) return NextResponse.next();

  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await verificarToken(token);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
