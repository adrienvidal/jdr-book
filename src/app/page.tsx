import Link from "next/link";
import { listCharacters } from "@/app/actions/characters";

export default async function Home() {
  const characters = await listCharacters();
  return (
    <main className="min-h-screen p-6 sm:p-10 max-w-5xl mx-auto">
      <div className="flex items-end justify-between mb-8 border-b border-line pb-5">
        <div>
          <h1 className="font-cairn text-5xl sm:text-6xl leading-none">Cairn</h1>
          <p className="text-muted mt-2 text-sm tracking-wide">Compagnon de campagne</p>
        </div>
        <Link
          href="/character/new"
          className="rounded bg-accent text-accent-fg px-4 py-2 text-sm hover:opacity-90"
        >
          + Ajouter un personnage
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
        {characters.map((c) => (
          <Link
            key={c.id}
            href={`/character/${c.id}`}
            className="group aspect-[3/4] rounded-lg border border-line bg-panel overflow-hidden flex flex-col shadow-sm hover:shadow-md hover:border-accent transition-shadow"
          >
            <div className="flex-1 bg-[#ddd2b4] overflow-hidden">
              {c.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.imageUrl}
                  alt={c.name}
                  className="w-full h-full object-cover sepia-[.12] group-hover:sepia-0 transition-[filter]"
                />
              )}
            </div>
            <div className="p-2 text-center font-cairn text-xl">{c.name}</div>
          </Link>
        ))}
        <Link
          href="/mj"
          className="aspect-[3/4] rounded-lg border-2 border-dashed border-moss/60 grid place-items-center text-center px-2 hover:border-moss hover:bg-panel/60 transition-colors"
        >
          <span className="font-cairn text-2xl text-moss">Interface&nbsp;MJ</span>
        </Link>
      </div>
    </main>
  );
}
