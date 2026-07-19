import { createCharacterForm } from "@/app/actions/characters";

export default function NewCharacter() {
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <form action={createCharacterForm} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Nouveau personnage</h1>
        <input
          name="name"
          placeholder="Nom"
          autoFocus
          required
          className="w-full rounded border px-3 py-2 bg-transparent"
        />
        <button className="w-full rounded bg-emerald-700 text-white py-2">Créer</button>
      </form>
    </main>
  );
}
