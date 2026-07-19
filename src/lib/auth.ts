import { SignJWT, jwtVerify } from "jose";

export type Scope = "app" | "mj";

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET manquant");
  return new TextEncoder().encode(s);
}

export function cookieName(scope: Scope): string {
  return scope === "app" ? "app_auth" : "mj_auth";
}

export function checkPassword(scope: Scope, password: string): boolean {
  const expected = scope === "app" ? process.env.APP_PASSWORD : process.env.MJ_PASSWORD;
  return !!expected && password === expected;
}

export async function signSession(scope: Scope): Promise<string> {
  return new SignJWT({ scope })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
}

export async function verifySession(token: string | undefined, scope: Scope): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.scope === scope;
  } catch {
    return false;
  }
}
