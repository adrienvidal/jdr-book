import Link from "next/link";
import { listCharacters } from "@/app/actions/characters";
import { listNotes } from "@/app/actions/notes";
import { usedSlots } from "@/lib/inventory";
import { MjNotes } from "@/components/MjNotes";

export default async function MjPage() {
  const [characters, notes] = await Promise.all([listCharacters(), listNotes()]);
  return (
    <main className="min-h-screen p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Interface MJ</h1>
        <Link href="/" className="text-sm underline">
          ← Accueil
        </Link>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-3">Personnages</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b">
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
