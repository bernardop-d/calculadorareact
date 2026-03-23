import { NextRequest, NextResponse } from "next/server";

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

/** Decodifica o payload do JWT sem verificar assinatura (usado só para roteamento).
 *  A verificação real da assinatura acontece em getAuthUser() em cada API route. */
function decodeToken(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (!payload.exp || Date.now() / 1000 > payload.exp) return null;
    return payload as JWTPayload;
  } catch {
    return null;
  }
}

const ADMIN_PATHS = ["/admin"];
const PROTECTED_PATHS = ["/dashboard", "/payment", "/content", "/profile"];
const AUTH_PATHS = ["/login", "/register"];

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Arquivos estáticos e internos do Next.js — passa direto
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|mp4|webm|woff2?)$/)
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("auth_token")?.value;
  const payload = token ? decodeToken(token) : null;

  // Rotas de admin — exige token + role ADMIN
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    if (!payload) return NextResponse.redirect(new URL("/login", req.url));
    if (payload.role !== "ADMIN") return NextResponse.redirect(new URL("/dashboard", req.url));
    return NextResponse.next();
  }

  // Rotas protegidas — exige login
  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
    if (!payload) {
      const url = new URL("/login", req.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Usuário já logado tentando acessar login/register → redireciona
  if (payload && AUTH_PATHS.includes(pathname)) {
    return NextResponse.redirect(
      new URL(payload.role === "ADMIN" ? "/admin" : "/dashboard", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
