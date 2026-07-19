import Link from "next/link";
import { Plus, Shield, UserPlus } from "lucide-react";
import { listCharacters } from "@/app/actions/characters";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const characters = await listCharacters();
  const empty = characters.length === 0;

  return (
    <main className="min-h-screen p-4 sm:p-8 md:p-10 max-w-5xl mx-auto">
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6 sm:mb-8 border-b border-line pb-4 sm:pb-5">
        <div>
          <h1 className="font-cairn text-4xl sm:text-6xl leading-none">Cairn</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm tracking-wide">
            Compagnon de campagne
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/character/new">
            <Plus /> Ajouter un personnage
          </Link>
        </Button>
      </header>

      {empty ? (
        <div className="rounded-xl border-2 border-dashed border-line bg-card/40 py-16 px-6 text-center">
          <UserPlus className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="font-cairn text-2xl">Aucun personnage pour l&apos;instant</p>
          <p className="text-muted-foreground text-sm mt-1 mb-5">
            Créez le premier aventurier de la table.
          </p>
          <Button asChild>
            <Link href="/character/new">
              <Plus /> Créer un personnage
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
          {characters.map((c) => (
            <Link
              key={c.id}
              href={`/character/${c.id}`}
              className="group aspect-[3/4] rounded-lg border border-line bg-card overflow-hidden flex flex-col shadow-sm hover:shadow-md hover:border-primary transition-all focus-visible:border-primary"
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
              <div className="p-2 text-center font-cairn text-lg sm:text-xl truncate">{c.name}</div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 sm:mt-10">
        <Link
          href="/mj"
          className="group flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-moss/50 py-4 text-center hover:border-moss hover:bg-card/60 transition-colors focus-visible:border-moss"
        >
          <Shield className="size-5 text-moss" />
          <span className="font-cairn text-xl sm:text-2xl text-moss">Interface&nbsp;MJ</span>
        </Link>
      </div>
    </main>
  );
}
