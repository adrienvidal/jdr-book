import { createCharacterForm } from "@/app/actions/characters";

export default function NewCharacter() {
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <form action={createCharacterForm} className="w-full max-w-sm space-y-4 rounded-xl border-2 border-line bg-panel/60 p-8 shadow-sm">
        <h1 className="font-cairn text-3xl text-center">Nouveau personnage</h1>
        <input
          name="name"
          placeholder="Nom"
          autoFocus
          required
          className="w-full rounded border border-line bg-panel px-3 py-2"
        />
        <button className="w-full rounded bg-accent text-accent-fg py-2 hover:opacity-90">Créer</button>
      </form>
    </main>
  );
}
