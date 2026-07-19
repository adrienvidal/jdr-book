import { loginApp } from "@/app/actions/session";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <form action={loginApp} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Cairn — Accès</h1>
        {error && <p className="text-red-500 text-sm">Mot de passe incorrect.</p>}
        <input
          name="password"
          type="password"
          placeholder="Mot de passe"
          autoFocus
          suppressHydrationWarning
          className="w-full rounded border px-3 py-2 bg-transparent"
        />
        <button className="w-full rounded bg-emerald-700 text-white py-2">Entrer</button>
      </form>
    </main>
  );
}
