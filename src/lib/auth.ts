import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "app_auth";

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET manquant");
  return new TextEncoder().encode(s);
}

export function checkPassword(password: string): boolean {
  const expected = process.env.APP_PASSWORD;
  return !!expected && password === expected;
}

export async function signSession(): Promise<string> {
  // Le claim `scope` est conservé pour rester compatible avec les cookies
  // déjà émis (l'app avait autrefois un second scope « mj »).
  return new SignJWT({ scope: "app" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
}

export async function verifySession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.scope === "app";
  } catch {
    return false;
  }
}
