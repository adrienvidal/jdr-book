"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import type { Character, Item } from "@prisma/client";
import { deleteCharacter, updateCharacter } from "@/app/actions/characters";
import { InventoryEditor } from "@/components/InventoryEditor";
import { PortraitUpload } from "@/components/PortraitUpload";
import { MAX_SLOTS } from "@/lib/inventory";
import { useFieldSave } from "@/lib/use-field-save";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type CharacterWithItems = Character & { items: Item[] };

function FatigueBar({
  fatigue,
  onChange,
}: {
  fatigue: number;
  onChange: (n: number) => void;
}) {
  return (
    <Card className="p-3 sm:p-4 gap-0">
      <div className="flex items-center justify-between mb-2">
        <span className="font-cairn text-lg">Fatigue</span>
        <span className="text-xs text-muted-foreground">
          {fatigue}/{MAX_SLOTS} · occupe des slots
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => onChange(fatigue - 1)}
          disabled={fatigue <= 0}
          aria-label="Retirer une fatigue"
        >
          <Minus />
        </Button>
        <div className="flex gap-1 flex-1">
          {Array.from({ length: MAX_SLOTS }, (_, i) => {
            const filled = i < fatigue;
            return (
              <button
                type="button"
                key={i}
                onClick={() => onChange(filled && i === fatigue - 1 ? i : i + 1)}
                aria-label={`Fatigue ${i + 1}`}
                aria-pressed={filled}
                className={`flex-1 h-6 rounded-sm border transition-colors ${
                  filled
                    ? "bg-primary border-primary"
                    : "bg-card border-line hover:border-primary/60"
                }`}
              />
            );
          })}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => onChange(fatigue + 1)}
          disabled={fatigue >= MAX_SLOTS}
          aria-label="Ajouter une fatigue"
        >
          <Plus />
        </Button>
      </div>
    </Card>
  );
}

export function CharacterSheet({ character }: { character: CharacterWithItems }) {
  const router = useRouter();
  const id = character.id;
  const [fatigue, setFatigue] = useState(character.fatigue);

  const save = useFieldSave({
    name: character.name,
    epuise: character.epuise,
    armure: character.armure,
    sous: character.sous,
    force: character.force,
    forceMax: character.forceMax,
    dex: character.dex,
    dexMax: character.dexMax,
    vol: character.vol,
    volMax: character.volMax,
    pv: character.pv,
    pvMax: character.pvMax,
    passe: character.passe,
    traits: character.traits,
    liens: character.liens,
    presages: character.presages,
    notes: character.notes,
    fatigue: character.fatigue,
  });

  const saveField = (field: string, value: unknown) =>
    save(field, value, () => updateCharacter(id, { [field]: value }));

  function changeFatigue(n: number) {
    const v = Math.max(0, Math.min(MAX_SLOTS, n));
    setFatigue(v);
    saveField("fatigue", v);
  }

  async function onDelete() {
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
    <main className="min-h-screen p-4 sm:p-6 max-w-4xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/">
            <ArrowLeft /> Accueil
          </Link>
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 /> Supprimer
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer ce personnage ?</AlertDialogTitle>
              <AlertDialogDescription>
                « {character.name || "Sans nom"} » et tout son inventaire seront définitivement
                perdus. Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>Supprimer définitivement</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Feuille */}
      <article className="rounded-xl border-2 border-line bg-card/50 shadow-sm p-4 sm:p-6 space-y-5 sm:space-y-6">
        {/* En-tête : portrait + nom + épuisé */}
        <section className="flex flex-col sm:flex-row gap-4 sm:items-start">
          <div className="w-28 shrink-0 space-y-2 mx-auto sm:mx-0">
            <div className="aspect-[3/4] rounded border border-line overflow-hidden bg-[#ddd2b4]">
              {character.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={character.imageUrl}
                  alt={character.name}
                  className="w-full h-full object-cover sepia-[.1]"
                />
              )}
            </div>
            <PortraitUpload characterId={id} />
          </div>

          <div className="flex-1 space-y-3">
            <div className="font-cairn text-2xl sm:text-3xl leading-none text-primary text-center sm:text-left">
              Cairn
            </div>
            <Input
              defaultValue={character.name}
              onBlur={(e) => saveField("name", e.target.value)}
              placeholder="Nom du personnage"
              className="text-xl sm:text-2xl h-auto py-2 font-cairn"
            />
            <label className="flex items-center gap-2 text-sm w-fit cursor-pointer">
              <Checkbox
                defaultChecked={character.epuise}
                onCheckedChange={(v) => saveField("epuise", v === true)}
              />
              Épuisé·e
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="rounded-lg border border-line bg-card/70 p-3 flex items-center justify-between gap-2">
                <span className="font-cairn">Armure</span>
                <Input
                  type="number"
                  defaultValue={character.armure}
                  onBlur={(e) => saveField("armure", Number(e.target.value))}
                  className="w-16 text-center tabular-nums"
                />
              </label>
              <label className="rounded-lg border border-line bg-card/70 p-3 flex items-center justify-between gap-2">
                <span className="font-cairn">Sous</span>
                <Input
                  type="number"
                  defaultValue={character.sous}
                  onBlur={(e) => saveField("sous", Number(e.target.value))}
                  className="w-20 text-center tabular-nums"
                />
              </label>
            </div>
          </div>
        </section>

        {/* Attributs */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {attributs.map(([label, field, cur, max]) => (
            <div key={field} className="rounded-lg border border-line bg-card/70 p-3 text-center">
              <div className="font-cairn text-lg">{label}</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Input
                  type="number"
                  defaultValue={cur}
                  onBlur={(e) => saveField(field, Number(e.target.value))}
                  aria-label={`${label} actuel`}
                  className="w-14 text-center tabular-nums px-1"
                />
                <span className="text-muted-foreground">/</span>
                <Input
                  type="number"
                  defaultValue={max}
                  onBlur={(e) => saveField(`${field}Max`, Number(e.target.value))}
                  aria-label={`${label} max`}
                  className="w-14 text-center tabular-nums px-1"
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
            <div key={field} className="space-y-1.5">
              <Label htmlFor={`field-${field}`} className="font-cairn text-lg">
                {label}
              </Label>
              <Textarea
                id={`field-${field}`}
                defaultValue={value}
                onBlur={(e) => saveField(field, e.target.value)}
                rows={3}
              />
            </div>
          ))}
        </section>
      </article>
    </main>
  );
}
