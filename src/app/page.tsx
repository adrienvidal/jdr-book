import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Plus, Shield, UserPlus } from "lucide-react";
import { listCharacters } from "@/app/actions/characters";
import { getCampaign } from "@/app/actions/campaign";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const [characters, campaign] = await Promise.all([listCharacters(), getCampaign()]);
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
              className="group relative aspect-[9/16] rounded-lg border border-line bg-[#ddd2b4] overflow-hidden shadow-sm hover:shadow-md hover:border-primary transition-all focus-visible:border-primary"
            >
              <Image
                src={c.imageUrl || "/default-character.webp"}
                alt={c.name}
                fill
                priority
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                className="object-cover sepia-[.12] group-hover:sepia-0 transition-[filter]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-3 pb-2.5 pt-10">
                <span className="block text-center font-cairn text-lg sm:text-xl text-parch truncate drop-shadow-sm">
                  {c.name || "Sans nom"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 sm:mt-10">
        <Link
          href="/mj"
          className="group flex items-stretch gap-4 rounded-lg border-2 border-moss/50 bg-card/40 overflow-hidden hover:border-moss hover:bg-card/70 transition-colors focus-visible:border-moss"
        >
          <div className="relative w-20 sm:w-24 shrink-0 aspect-[9/16] bg-[#d9dcc3] overflow-hidden">
            {campaign.mjImageUrl ? (
              <Image
                src={campaign.mjImageUrl}
                alt="Meneur de jeu"
                fill
                priority
                sizes="96px"
                className="object-cover sepia-[.12] group-hover:sepia-0 transition-[filter]"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Shield className="size-6 text-moss/40" />
              </div>
            )}
          </div>
          <div className="flex flex-1 items-center justify-between gap-4 py-4 pr-5">
            <div className="flex items-center gap-3">
              <Shield className="size-6 text-moss shrink-0" />
              <div>
                <span className="block font-cairn text-xl sm:text-2xl text-moss leading-none">
                  Interface&nbsp;MJ
                </span>
                <span className="mt-1.5 block text-sm text-muted-foreground">
                  Vue meneur — PV, jets &amp; notes secrètes
                </span>
              </div>
            </div>
            <ChevronRight className="size-5 text-moss/50 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>
      </div>
    </main>
  );
}
