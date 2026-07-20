import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Shield } from "lucide-react";
import { listCharacters } from "@/app/actions/characters";
import { getCampaign } from "@/app/actions/campaign";
import { listNotes } from "@/app/actions/notes";
import { uploadMjPortrait } from "@/app/actions/upload";
import { usedSlots } from "@/lib/inventory";
import { cn } from "@/lib/utils";
import { AnimatedPortrait } from "@/components/AnimatedPortrait";
import { ANIMATED_MJ_PORTRAITS } from "@/lib/animated-portraits";
import { MjNotes } from "@/components/MjNotes";
import { MjTitleInput } from "@/components/MjTitleInput";
import { PortraitUpload } from "@/components/PortraitUpload";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Meneur de jeu" };

export default async function MjPage() {
  const [characters, notes, campaign] = await Promise.all([
    listCharacters(),
    listNotes(),
    getCampaign(),
  ]);

  const mjAnimatedSrc = ANIMATED_MJ_PORTRAITS[campaign.id];
  const nbCharacters = characters.length;
  const nbNotes = notes.length;
  const nbExhausted = characters.filter((c) => c.epuise).length;

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 pb-10 sm:px-6">
      {/* Hero plein écran (comme la fiche perso), décliné MJ */}
      <div className="relative left-1/2 right-1/2 -mx-[50vw] h-[26rem] w-screen overflow-hidden bg-ink sm:h-[30rem]">
        {/* Fond : portrait MJ adouci, remplit les bords */}
        <Image
          src={campaign.mjImageUrl || "/default-character.webp"}
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          className="scale-105 object-cover blur-md"
        />
        <div className="absolute inset-0 bg-black/15" />

        {/* Portrait net, centré — animé si la campagne a une vidéo */}
        {mjAnimatedSrc ? (
          <AnimatedPortrait
            videoSrc={mjAnimatedSrc}
            imageUrl={campaign.mjImageUrl || "/default-character.webp"}
            alt="Meneur de jeu"
          />
        ) : (
          <div className="absolute inset-y-0 left-1/2 aspect-[9/16] -translate-x-1/2">
            <Image
              src={campaign.mjImageUrl || "/default-character.webp"}
              alt="Meneur de jeu"
              fill
              priority
              sizes="(max-width: 640px) 60vw, 280px"
              className="object-cover sepia-[.08]"
            />
          </div>
        )}

        {/* Barre du haut : Accueil */}
        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/55 to-transparent">
          <div className="mx-auto flex max-w-5xl items-center px-4 py-3 sm:px-6">
            <Button
              asChild
              variant="ghost"
              size="default"
              className="text-parch hover:bg-white/10 hover:text-white sm:text-base [&_svg]:sm:size-5"
            >
              <Link href="/table">
                <ArrowLeft /> Accueil
              </Link>
            </Button>
          </div>
        </div>

        {/* Dégradé bas : identité MJ + bouton photo */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent pt-20">
          <div className="mx-auto flex max-w-5xl items-end justify-between gap-3 px-4 py-4 sm:px-6 sm:py-6">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-parch/70 sm:text-sm">
                <Shield className="size-4" /> Meneur de jeu
              </p>
              <MjTitleInput title={campaign.mjTitle} />
              <p className="mt-2 text-sm text-parch/80">
                {nbCharacters} personnage{nbCharacters > 1 ? "s" : ""}
                {nbExhausted > 0 && (
                  <span className="text-red-300">
                    {" · "}
                    {nbExhausted} épuisé{nbExhausted > 1 ? "s" : ""}
                  </span>
                )}
                {" · "}
                {nbNotes} note{nbNotes > 1 ? "s" : ""} secrète{nbNotes > 1 ? "s" : ""}
              </p>
            </div>
            <PortraitUpload
              action={uploadMjPortrait}
              label={null}
              size="icon"
              className="size-10 shrink-0 rounded-full border-0 bg-ink/60 text-parch shadow-md backdrop-blur-sm hover:bg-ink/80"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-8 sm:mt-10 sm:space-y-10">
      <section>
        <div className="mb-4 flex items-center gap-3">
          <h2 className="font-cairn text-2xl leading-none">Personnages</h2>
          <div className="h-px flex-1 bg-line" />
        </div>

        {nbCharacters === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun personnage.</p>
        ) : (
          <>
            {/* Desktop : tableau */}
            <div className="hidden overflow-x-auto rounded-lg border border-line bg-card/60 md:block">
              <table className="w-full border-collapse text-sm [&_td]:px-3 [&_th]:px-3 [&_td:first-child]:pl-4 [&_th:first-child]:pl-4 [&_td:last-child]:pr-4 [&_th:last-child]:pr-4">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2.5 font-medium">Nom</th>
                    <th className="font-medium">PV</th>
                    <th className="font-medium">FOR</th>
                    <th className="font-medium">DEX</th>
                    <th className="font-medium">VOL</th>
                    <th className="font-medium">Armure</th>
                    <th className="font-medium">Sous</th>
                    <th className="font-medium">État</th>
                    <th className="font-medium">Slots</th>
                  </tr>
                </thead>
                <tbody>
                  {characters.map((c) => (
                    <tr
                      key={c.id}
                      className={cn(
                        "border-b border-line/60 transition-colors last:border-0 hover:bg-primary/5",
                        c.epuise && "bg-destructive/5",
                      )}
                    >
                      <td className="py-2">
                        <Link
                          href={`/character/${c.id}`}
                          className="group flex items-center gap-3"
                        >
                          <span className="relative size-9 shrink-0 overflow-hidden rounded border border-line bg-[#ddd2b4]">
                            <Image
                              src={c.imageUrl || "/default-character.webp"}
                              alt=""
                              fill
                              sizes="36px"
                              className="object-cover"
                            />
                          </span>
                          <span className="truncate font-medium text-primary group-hover:underline">
                            {c.name || "Sans nom"}
                          </span>
                        </Link>
                      </td>
                      <td className="tabular-nums">
                        {c.pv}/{c.pvMax}
                      </td>
                      <td className="tabular-nums">{c.force}</td>
                      <td className="tabular-nums">{c.dex}</td>
                      <td className="tabular-nums">{c.vol}</td>
                      <td className="tabular-nums">{c.armure}</td>
                      <td className="tabular-nums">{c.sous}</td>
                      <td>
                        {c.epuise ? (
                          <Badge variant="destructive">Épuisé</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="tabular-nums">{usedSlots(c.items, c.fatigue)}/10</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile : cartes empilées */}
            <div className="grid gap-3 md:hidden">
              {characters.map((c) => (
                <Card key={c.id} className="gap-2 p-3">
                  <div className="flex items-center gap-3">
                    <span className="relative size-11 shrink-0 overflow-hidden rounded border border-line bg-[#ddd2b4]">
                      <Image
                        src={c.imageUrl || "/default-character.webp"}
                        alt=""
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </span>
                    <Link
                      href={`/character/${c.id}`}
                      className="min-w-0 flex-1 truncate font-cairn text-xl text-primary underline"
                    >
                      {c.name || "Sans nom"}
                    </Link>
                    {c.epuise && <Badge variant="destructive">Épuisé</Badge>}
                  </div>
                  <Separator />
                  <dl className="grid grid-cols-3 gap-y-2 text-sm tabular-nums">
                    <Stat label="PV" value={`${c.pv}/${c.pvMax}`} />
                    <Stat label="Slots" value={`${usedSlots(c.items, c.fatigue)}/10`} />
                    <Stat label="FOR" value={c.force} />
                    <Stat label="DEX" value={c.dex} />
                    <Stat label="VOL" value={c.vol} />
                    <Stat label="Armure" value={c.armure} />
                    <Stat label="Sous" value={c.sous} />
                  </dl>
                </Card>
              ))}
            </div>
          </>
        )}
      </section>

        <MjNotes notes={notes} />
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
