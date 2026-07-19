import Link from "next/link";
import Image from "next/image";
import { Plus, Shield, UserPlus } from "lucide-react";
import { listCharacters } from "@/app/actions/characters";
import { getCampaign } from "@/app/actions/campaign";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "La table" };

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
        <section>
          <SectionHeading>Personnages</SectionHeading>
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
        </section>
      )}

      <section className="mt-8 sm:mt-10">
        <SectionHeading moss icon={<Shield className="size-5 text-moss shrink-0" />}>
          Meneur de jeu
        </SectionHeading>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
          <Link
            href="/mj"
            className="group relative aspect-[9/16] rounded-lg border-2 border-moss/60 bg-[#d9dcc3] overflow-hidden shadow-sm ring-1 ring-inset ring-moss/15 hover:shadow-md hover:border-moss transition-all focus-visible:border-moss"
          >
            <Image
              src={campaign.mjImageUrl || "/default-character.webp"}
              alt="Meneur de jeu"
              fill
              priority
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              className="object-cover sepia-[.12] group-hover:sepia-0 transition-[filter]"
            />
            <div className="absolute right-2 top-2 rounded-full bg-moss/85 p-1.5 shadow-sm ring-1 ring-black/10">
              <Shield className="size-4 text-moss-fg" />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#20281a]/90 via-[#20281a]/45 to-transparent px-3 pb-2.5 pt-10 text-center">
              <span className="block font-cairn text-lg sm:text-xl text-moss-fg leading-none drop-shadow-sm truncate">
                {campaign.mjTitle}
              </span>
              <span className="mt-1 block text-[11px] uppercase tracking-wide text-moss-fg/75">
                Meneur de jeu
              </span>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}

function SectionHeading({
  children,
  moss = false,
  icon,
}: {
  children: React.ReactNode;
  moss?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center gap-3 sm:mb-4">
      {icon}
      <h2
        className={`font-cairn text-xl leading-none sm:text-2xl ${
          moss ? "text-moss" : "text-foreground"
        }`}
      >
        {children}
      </h2>
      <div className={`h-px flex-1 ${moss ? "bg-moss/25" : "bg-line"}`} />
    </div>
  );
}
