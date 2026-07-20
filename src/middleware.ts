import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, verifySession } from "@/lib/auth";

const PUBLIC = ["/", "/login", "/opengraph-image", "/icon", "/apple-icon"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.includes(pathname)) return NextResponse.next();

  const appOk = await verifySession(req.cookies.get(COOKIE_NAME)?.value);
  if (!appOk) return NextResponse.redirect(new URL("/?login=1", req.url));

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
