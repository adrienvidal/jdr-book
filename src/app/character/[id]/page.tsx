import { notFound } from "next/navigation";
import { getCharacter } from "@/app/actions/characters";
import { CharacterSheet } from "@/components/CharacterSheet";

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
