"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Character, Item } from "@prisma/client";
import { deleteCharacter, updateCharacter } from "@/app/actions/characters";
import { uploadPortrait } from "@/app/actions/upload";
import { InventoryEditor } from "@/components/InventoryEditor";
import { MAX_SLOTS } from "@/lib/inventory";

type CharacterWithItems = Character & { items: Item[] };

const inputCls = "rounded border px-2 py-1 bg-transparent";

function FatigueBar({
  fatigue,
  onChange,
}: {
  fatigue: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="rounded border p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold">Fatigue</span>
        <span className="text-xs text-neutral-500">
          {fatigue}/{MAX_SLOTS} · occupe des slots
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(fatigue - 1)}
          disabled={fatigue <= 0}
          aria-label="Retirer une fatigue"
          className="rounded border w-7 h-7 leading-none disabled:opacity-30"
        >
          −
        </button>
        <div className="flex gap-1 flex-1">
          {Array.from({ length: MAX_SLOTS }, (_, i) => {
            const filled = i < fatigue;
            return (
              <button
                type="button"
                key={i}
                onClick={() => onChange(filled && i === fatigue - 1 ? i : i + 1)}
                aria-label={`Fatigue ${i + 1}`}
                className={`flex-1 h-6 rounded-sm border ${
                  filled ? "bg-red-600 border-red-600" : "bg-transparent"
                }`}
              />
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => onChange(fatigue + 1)}
          disabled={fatigue >= MAX_SLOTS}
          aria-label="Ajouter une fatigue"
          className="rounded border w-7 h-7 leading-none disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function CharacterSheet({ character }: { character: CharacterWithItems }) {
  const router = useRouter();
  const id = character.id;
  const [fatigue, setFatigue] = useState(character.fatigue);
  const save = (data: Record<string, unknown>) => updateCharacter(id, data);

  function changeFatigue(n: number) {
    const v = Math.max(0, Math.min(MAX_SLOTS, n));
    setFatigue(v);
    save({ fatigue: v });
  }

  async function onDelete() {
    if (!confirm(`Supprimer définitivement « ${character.name} » ?`)) return;
    await deleteCharacter(id);
    router.push("/");
  }

  const attributs: [string, string, number, number][] = [
    ["FOR", "force", character.force, character.forceMax],
    ["DEX", "dex", character.dex, character.dexMax],
    ["VOL", "vol", character.vol, character.volMax],
    ["PV", "pv", character.pv, character.pvMax],
  ];

  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm underline">
          ← Accueil
        </Link>
        <button onClick={onDelete} className="text-sm text-red-500 underline">
          Supprimer ce personnage
        </button>
      </div>

      {/* En-tête : portrait + nom + épuisé */}
      <section className="flex gap-4 items-start">
        <div className="w-28 shrink-0 space-y-2">
          <div className="aspect-[3/4] rounded border overflow-hidden bg-neutral-800">
            {character.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={character.imageUrl}
                alt={character.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <form action={uploadPortrait.bind(null, id)} className="text-xs space-y-1">
            <input type="file" name="file" accept="image/*" className="w-full text-xs" />
            <button className="underline">Importer</button>
          </form>
        </div>
        <div className="flex-1 space-y-3">
          <input
            defaultValue={character.name}
            onBlur={(e) => save({ name: e.target.value })}
            placeholder="Nom"
            className={`${inputCls} text-2xl font-semibold w-full`}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              defaultChecked={character.epuise}
              onChange={(e) => save({ epuise: e.target.checked })}
            />
            Épuisé·e
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="rounded border p-3 flex items-center justify-between">
              <span className="font-semibold">Armure</span>
              <input
                type="number"
                defaultValue={character.armure}
                onBlur={(e) => save({ armure: Number(e.target.value) })}
                className={`${inputCls} w-20 text-center`}
              />
            </label>
            <label className="rounded border p-3 flex items-center justify-between">
              <span className="font-semibold">Sous 🪙</span>
              <input
                type="number"
                defaultValue={character.sous}
                onBlur={(e) => save({ sous: Number(e.target.value) })}
                className={`${inputCls} w-24 text-center`}
              />
            </label>
          </div>
        </div>
      </section>

      {/* Attributs */}
      <section className="grid grid-cols-4 gap-3">
        {attributs.map(([label, field, cur, max]) => (
          <div key={field} className="rounded border p-3 text-center">
            <div className="font-semibold">{label}</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <input
                type="number"
                defaultValue={cur}
                onBlur={(e) => save({ [field]: Number(e.target.value) })}
                className={`${inputCls} w-14 text-center`}
              />
              <span className="text-neutral-500">/</span>
              <input
                type="number"
                defaultValue={max}
                onBlur={(e) => save({ [`${field}Max`]: Number(e.target.value) })}
                className={`${inputCls} w-14 text-center`}
              />
            </div>
          </div>
        ))}
      </section>

      {/* Fatigue */}
      <FatigueBar fatigue={fatigue} onChange={changeFatigue} />

      {/* Inventaire */}
      <InventoryEditor items={character.items} characterId={id} fatigue={fatigue} />

      {/* Passé + blocs texte */}
      <section className="grid md:grid-cols-2 gap-4">
        {(
          [
            ["Passé", "passe", character.passe],
            ["Traits", "traits", character.traits],
            ["Liens", "liens", character.liens],
            ["Présages", "presages", character.presages],
            ["Notes", "notes", character.notes],
          ] as [string, string, string][]
        ).map(([label, field, value]) => (
          <label key={field} className="block text-sm">
            <span className="font-semibold">{label}</span>
            <textarea
              defaultValue={value}
              onBlur={(e) => save({ [field]: e.target.value })}
              rows={3}
              className={`${inputCls} w-full mt-1`}
            />
          </label>
        ))}
      </section>
    </main>
  );
}
