"use client";
import { updateCampaignTitle } from "@/app/actions/campaign";
import { useFieldSave } from "@/lib/use-field-save";
import { Input } from "@/components/ui/input";

// Titre du MJ éditable en place (comme un nom de perso) : defaultValue + autosave onBlur.
export function MjTitleInput({ title }: { title: string }) {
  const save = useFieldSave({ mjTitle: title });

  return (
    <Input
      defaultValue={title}
      onBlur={(e) => save("mjTitle", e.target.value, () => updateCampaignTitle(e.target.value))}
      placeholder="Titre du meneur"
      aria-label="Titre du meneur de jeu"
      className="mt-1.5 h-auto border-0 bg-transparent px-0 py-0 font-cairn text-4xl text-parch shadow-none drop-shadow-lg placeholder:text-parch/50 focus-visible:ring-0 sm:text-5xl lg:text-6xl"
    />
  );
}
