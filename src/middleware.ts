import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth";

const PUBLIC = ["/login", "/mj/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.includes(pathname)) return NextResponse.next();

  const appOk = await verifySession(req.cookies.get("app_auth")?.value, "app");
  if (!appOk) return NextResponse.redirect(new URL("/login", req.url));

  // TODO(à remettre) : authentification MJ désactivée temporairement.
  // Réactiver en décommentant le bloc ci-dessous.
  // if (pathname.startsWith("/mj")) {
  //   const mjOk = await verifySession(req.cookies.get("mj_auth")?.value, "mj");
  //   if (!mjOk) return NextResponse.redirect(new URL("/mj/login", req.url));
  // }
  return NextResponse.next();
}

export const config = {
  // Exclut les internes Next et les assets statiques du dossier public (sinon
  // l'optimiseur next/image, qui va chercher l'image sans cookie d'auth, se fait
  // rediriger vers /login → image invalide).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
