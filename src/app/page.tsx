import Link from "next/link";
import { listCharacters } from "@/app/actions/characters";

export default async function Home() {
  const characters = await listCharacters();
  return (
    <main className="min-h-screen p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">Cairn</h1>
        <Link
          href="/character/new"
          className="rounded bg-emerald-700 text-white px-4 py-2 text-sm"
        >
          + Ajouter un personnage
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {characters.map((c) => (
          <Link
            key={c.id}
            href={`/character/${c.id}`}
            className="aspect-[3/4] rounded-lg border overflow-hidden flex flex-col hover:ring-2 ring-emerald-600"
          >
            <div className="flex-1 bg-neutral-800">
              {c.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="p-2 text-center font-medium">{c.name}</div>
          </Link>
        ))}
        <Link
          href="/mj"
          className="aspect-[3/4] rounded-lg border border-dashed grid place-items-center hover:ring-2 ring-amber-600"
        >
          <span className="font-semibold">Interface MJ</span>
        </Link>
      </div>
    </main>
  );
}
