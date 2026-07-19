import { loginApp } from "@/app/actions/session";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <form action={loginApp} className="w-full max-w-sm space-y-4 rounded-xl border-2 border-line bg-panel/60 p-8 shadow-sm">
        <h1 className="font-cairn text-5xl text-accent text-center leading-none">Cairn</h1>
        <p className="text-center text-muted text-sm -mt-2">Entrez pour rejoindre la table</p>
        {error && <p className="text-accent text-sm">Mot de passe incorrect.</p>}
        <input
          name="password"
          type="password"
          placeholder="Mot de passe"
          autoFocus
          suppressHydrationWarning
          className="w-full rounded border px-3 py-2 bg-transparent"
        />
        <button className="w-full rounded bg-accent text-accent-fg py-2 hover:opacity-90">Entrer</button>
      </form>
    </main>
  );
}
