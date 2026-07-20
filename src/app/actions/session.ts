"use server";
import { cookies } from "next/headers";
import { checkPassword, COOKIE_NAME, signSession } from "@/lib/auth";

async function setSessionCookie() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, await signSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

// Action de la modale de la landing (useActionState) : en cas d'échec on
// reste sur place avec un état d'erreur au lieu de rediriger.
// En cas de succès on ne redirige pas non plus — le cookie est posé, et c'est
// LandingEnter qui décide de la suite : la vidéo d'ouverture se joue d'abord,
// puis le client navigue vers /table.
export type LoginState = { error: boolean; ok?: boolean };

export async function loginAppAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) return { error: true };
  await setSessionCookie();
  return { error: false, ok: true };
}
