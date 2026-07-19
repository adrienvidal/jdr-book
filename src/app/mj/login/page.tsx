import { loginMj } from "@/app/actions/session";

export default async function MjLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <form action={loginMj} className="w-full max-w-sm space-y-4 rounded-xl border-2 border-line bg-panel/60 p-8 shadow-sm">
        <h1 className="font-cairn text-4xl text-moss text-center leading-none">Interface MJ</h1>
        <p className="text-center text-muted text-sm">Réservé au Warden</p>
        {error && <p className="text-accent text-sm">Mot de passe incorrect.</p>}
        <input
          name="password"
          type="password"
          placeholder="Mot de passe MJ"
          autoFocus
          suppressHydrationWarning
          className="w-full rounded border px-3 py-2 bg-transparent"
        />
        <button className="w-full rounded bg-moss text-accent-fg py-2 hover:opacity-90">Déverrouiller</button>
      </form>
    </main>
  );
}
