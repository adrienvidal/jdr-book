"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import type { Character, Item } from "@prisma/client";
import { deleteCharacter, updateCharacter } from "@/app/actions/characters";
import { uploadPortrait } from "@/app/actions/upload";
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
    <main className="mx-auto min-h-screen max-w-4xl px-4 pb-8 sm:px-6">
      {/* Hero plein écran (breakout) : portrait net + fond flouté, nom en surimpression */}
      <div className="relative left-1/2 right-1/2 -mx-[50vw] h-[26rem] w-screen overflow-hidden bg-ink sm:h-[30rem]">
        {/* Fond : même image, juste adoucie, pour remplir les bords (portrait vertical) */}
        <Image
          src={character.imageUrl || "/default-character.webp"}
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          className="scale-105 object-cover blur-md"
        />
        <div className="absolute inset-0 bg-black/15" />

        {/* Portrait net, non rogné, centré */}
        <div className="absolute inset-y-0 left-1/2 aspect-[9/16] -translate-x-1/2">
          <Image
            src={character.imageUrl || "/default-character.webp"}
            alt={character.name}
            fill
            priority
            sizes="(max-width: 640px) 60vw, 300px"
            className="object-cover sepia-[.08]"
          />
        </div>

        {/* Barre du haut : Accueil / Supprimer */}
        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/55 to-transparent">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-parch hover:bg-white/10 hover:text-white"
            >
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
        </div>

        {/* Dégradé bas : nom en surimpression (façon Steam) + bouton photo */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent pt-20">
          <div className="mx-auto flex max-w-4xl items-end justify-between gap-3 px-4 py-4 sm:px-6 sm:py-6">
            <div className="min-w-0 flex-1">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-parch/60">
                Cairn
              </span>
              <Input
                defaultValue={character.name}
                onBlur={(e) => saveField("name", e.target.value)}
                placeholder="Nom du personnage"
                aria-label="Nom du personnage"
                className="h-auto border-0 bg-transparent px-0 py-0 font-cairn text-3xl text-parch shadow-none drop-shadow-lg placeholder:text-parch/50 focus-visible:ring-0 sm:text-4xl"
              />
            </div>
            <PortraitUpload
              action={uploadPortrait.bind(null, id)}
              label={null}
              size="icon"
              className="size-10 shrink-0 rounded-full border-0 bg-ink/60 text-parch shadow-md backdrop-blur-sm hover:bg-ink/80"
            />
          </div>
        </div>
      </div>

      {/* Feuille */}
      <article className="mt-4 space-y-5 rounded-xl border-2 border-line bg-card/50 p-4 shadow-sm sm:mt-6 sm:space-y-6 sm:p-6">
        {/* État + Armure / Sous */}
        <section className="flex flex-wrap items-center gap-4">
          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              defaultChecked={character.epuise}
              onCheckedChange={(v) => saveField("epuise", v === true)}
            />
            Épuisé·e
          </label>
          <div className="grid min-w-[16rem] flex-1 grid-cols-2 gap-3">
            <label className="flex items-center justify-between gap-2 rounded-lg border border-line bg-card/70 p-3">
              <span className="font-cairn">Armure</span>
              <Input
                type="number"
                defaultValue={character.armure}
                onBlur={(e) => saveField("armure", Number(e.target.value))}
                className="w-16 text-center tabular-nums"
              />
            </label>
            <label className="flex items-center justify-between gap-2 rounded-lg border border-line bg-card/70 p-3">
              <span className="font-cairn">Sous</span>
              <Input
                type="number"
                defaultValue={character.sous}
                onBlur={(e) => saveField("sous", Number(e.target.value))}
                className="w-20 text-center tabular-nums"
              />
            </label>
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
