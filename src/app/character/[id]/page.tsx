import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCharacter } from "@/app/actions/characters";
import { CharacterSheet } from "@/components/CharacterSheet";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const character = await getCharacter(id);
  return { title: character?.name || "Personnage" };
}

export default async function CharacterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const character = await getCharacter(id);
  if (!character) notFound();
  return <CharacterSheet character={character} />;
}
