"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { checkPassword, cookieName, signSession, type Scope } from "@/lib/auth";

async function login(scope: Scope, password: string, dest: string, fail: string) {
  if (!checkPassword(scope, password)) redirect(fail);
  const jar = await cookies();
  jar.set(cookieName(scope), await signSession(scope), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect(dest);
}

export async function loginApp(formData: FormData) {
  await login("app", String(formData.get("password") ?? ""), "/table", "/login?error=1");
}

export async function loginMj(formData: FormData) {
  await login("mj", String(formData.get("password") ?? ""), "/mj", "/mj/login?error=1");
}
