import Link from "next/link";
import { listCharacters } from "@/app/actions/characters";
import { listNotes } from "@/app/actions/notes";
import { usedSlots } from "@/lib/inventory";
import { MjNotes } from "@/components/MjNotes";

export default async function MjPage() {
  const [characters, notes] = await Promise.all([listCharacters(), listNotes()]);
  return (
    <main className="min-h-screen p-6 max-w-5xl mx-auto space-y-8">
      <div className="border-b border-line pb-4">
        <Link href="/" className="text-sm text-muted hover:text-accent underline">
          ← Accueil
        </Link>
        <h1 className="font-cairn text-5xl text-moss leading-none mt-2">Interface MJ</h1>
      </div>

      <section>
        <h2 className="font-cairn text-2xl mb-3">Personnages</h2>
        <div className="overflow-x-auto rounded-lg border border-line bg-panel/60">
          <table className="w-full text-sm border-collapse [&_th]:px-3 [&_td]:px-3 [&_th:first-child]:pl-4 [&_td:first-child]:pl-4 [&_th:last-child]:pr-4 [&_td:last-child]:pr-4">
            <thead>
              <tr className="text-left border-b border-line text-muted">
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
                <tr key={c.id} className="border-b">
                  <td className="py-2">
                    <Link href={`/character/${c.id}`} className="underline">
                      {c.name}
                    </Link>
                  </td>
                  <td>
                    {c.pv}/{c.pvMax}
                  </td>
                  <td>{c.force}</td>
                  <td>{c.dex}</td>
                  <td>{c.vol}</td>
                  <td>{c.epuise ? "oui" : "—"}</td>
                  <td>{usedSlots(c.items, c.fatigue)}/10</td>
                </tr>
              ))}
              {characters.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-2 text-neutral-500">
                    Aucun personnage.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <MjNotes notes={notes} />
    </main>
  );
}
