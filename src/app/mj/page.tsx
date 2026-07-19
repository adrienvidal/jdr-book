import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listCharacters } from "@/app/actions/characters";
import { listNotes } from "@/app/actions/notes";
import { usedSlots } from "@/lib/inventory";
import { MjNotes } from "@/components/MjNotes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function MjPage() {
  const [characters, notes] = await Promise.all([listCharacters(), listNotes()]);

  return (
    <main className="min-h-screen p-4 sm:p-6 max-w-5xl mx-auto space-y-8">
      <div className="border-b border-line pb-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/">
            <ArrowLeft /> Accueil
          </Link>
        </Button>
        <h1 className="font-cairn text-4xl sm:text-5xl text-moss leading-none mt-2">Interface MJ</h1>
      </div>

      <section>
        <h2 className="font-cairn text-2xl mb-3">Personnages</h2>

        {characters.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun personnage.</p>
        ) : (
          <>
            {/* Desktop : tableau */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-line bg-card/60">
              <table className="w-full text-sm border-collapse [&_th]:px-3 [&_td]:px-3 [&_th:first-child]:pl-4 [&_td:first-child]:pl-4 [&_th:last-child]:pr-4 [&_td:last-child]:pr-4">
                <thead>
                  <tr className="text-left border-b border-line text-muted-foreground">
                    <th className="py-2">Nom</th>
                    <th>PV</th>
                    <th>FOR</th>
                    <th>DEX</th>
                    <th>VOL</th>
                    <th>Épuisé</th>
                    <th>Slots</th>
                  </tr>
                </thead>
                <tbody>
                  {characters.map((c) => (
                    <tr key={c.id} className="border-b border-line/60 last:border-0">
                      <td className="py-2">
                        <Link href={`/character/${c.id}`} className="text-primary underline">
                          {c.name || "Sans nom"}
                        </Link>
                      </td>
                      <td className="tabular-nums">
                        {c.pv}/{c.pvMax}
                      </td>
                      <td className="tabular-nums">{c.force}</td>
                      <td className="tabular-nums">{c.dex}</td>
                      <td className="tabular-nums">{c.vol}</td>
                      <td>{c.epuise ? <Badge variant="destructive">oui</Badge> : "—"}</td>
                      <td className="tabular-nums">{usedSlots(c.items, c.fatigue)}/10</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile : cartes empilées */}
            <div className="grid gap-3 md:hidden">
              {characters.map((c) => (
                <Card key={c.id} className="p-3 gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/character/${c.id}`}
                      className="font-cairn text-xl text-primary underline truncate"
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
