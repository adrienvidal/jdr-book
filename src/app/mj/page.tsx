import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Shield } from "lucide-react";
import { listCharacters } from "@/app/actions/characters";
import { getCampaign } from "@/app/actions/campaign";
import { listNotes } from "@/app/actions/notes";
import { uploadMjPortrait } from "@/app/actions/upload";
import { usedSlots } from "@/lib/inventory";
import { cn } from "@/lib/utils";
import { MjNotes } from "@/components/MjNotes";
import { PortraitUpload } from "@/components/PortraitUpload";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function MjPage() {
  const [characters, notes, campaign] = await Promise.all([
    listCharacters(),
    listNotes(),
    getCampaign(),
  ]);

  const nbCharacters = characters.length;
  const nbNotes = notes.length;
  const nbExhausted = characters.filter((c) => c.epuise).length;

  return (
    <main className="min-h-screen max-w-5xl mx-auto p-4 sm:p-6 space-y-8 sm:space-y-10">
      <header className="border-b border-line pb-5">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/">
            <ArrowLeft /> Accueil
          </Link>
        </Button>
        <div className="mt-3 flex items-center gap-4 sm:gap-5">
          <div className="relative aspect-[9/16] w-20 shrink-0 overflow-hidden rounded-lg border border-moss/40 bg-[#d9dcc3] shadow-sm ring-1 ring-inset ring-moss/15 sm:w-24">
            <Image
              src={campaign.mjImageUrl || "/default-character.webp"}
              alt="Meneur de jeu"
              fill
              priority
              sizes="96px"
              className="object-cover sepia-[.1]"
            />
            <PortraitUpload
              action={uploadMjPortrait}
              label={null}
              size="icon"
              className="absolute bottom-1.5 right-1.5 size-8 rounded-full border-0 bg-ink/60 text-parch shadow-md backdrop-blur-sm hover:bg-ink/80"
            />
          </div>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-moss/80">
              <Shield className="size-3.5" /> Meneur de jeu
            </p>
            <h1 className="mt-1 font-cairn text-4xl leading-none text-moss sm:text-5xl">
              Interface&nbsp;MJ
            </h1>
            <p className="mt-2.5 text-sm text-muted-foreground">
              {nbCharacters} personnage{nbCharacters > 1 ? "s" : ""}
              {nbExhausted > 0 && (
                <span className="text-destructive"> · {nbExhausted} épuisé{nbExhausted > 1 ? "s" : ""}</span>
              )}
              {" · "}
              {nbNotes} note{nbNotes > 1 ? "s" : ""} secrète{nbNotes > 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </header>

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
                  </dl>
                </Card>
              ))}
            </div>
          </>
        )}
      </section>

      <MjNotes notes={notes} />
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
