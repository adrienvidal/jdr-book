import { loginMj } from "@/app/actions/session";

export default async function MjLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <form action={loginMj} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Interface MJ</h1>
        {error && <p className="text-red-500 text-sm">Mot de passe incorrect.</p>}
        <input
          name="password"
          type="password"
          placeholder="Mot de passe MJ"
          autoFocus
          className="w-full rounded border px-3 py-2 bg-transparent"
        />
        <button className="w-full rounded bg-amber-700 text-white py-2">Déverrouiller</button>
      </form>
    </main>
  );
}
