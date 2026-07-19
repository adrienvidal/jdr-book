"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { checkPassword, cookieName, signSession, type Scope } from "@/lib/auth";

async function setSessionCookie(scope: Scope) {
  const jar = await cookies();
  jar.set(cookieName(scope), await signSession(scope), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

async function login(scope: Scope, password: string, dest: string, fail: string) {
  if (!checkPassword(scope, password)) redirect(fail);
  await setSessionCookie(scope);
  redirect(dest);
}

export async function loginApp(formData: FormData) {
  await login("app", String(formData.get("password") ?? ""), "/table", "/login?error=1");
}

export async function loginMj(formData: FormData) {
  await login("mj", String(formData.get("password") ?? ""), "/mj", "/mj/login?error=1");
}

// Variante pour la modale de la landing (useActionState) : en cas d'échec on
// reste sur place avec un état d'erreur au lieu de rediriger vers /login.
export type LoginState = { error: boolean };

export async function loginAppAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  if (!checkPassword("app", password)) return { error: true };
  await setSessionCookie("app");
  redirect("/table");
}
