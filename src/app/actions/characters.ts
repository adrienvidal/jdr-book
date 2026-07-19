"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export type ItemInput = {
  name: string;
  slots: number;
  kind: string;
  degats?: string | null;
  armorValue?: number | null;
  uses?: number | null;
  description?: string;
};

export async function listCharacters() {
  return prisma.character.findMany({ orderBy: { name: "asc" }, include: { items: true } });
}

export async function getCharacter(id: string) {
  return prisma.character.findUnique({ where: { id }, include: { items: true } });
}

export async function createCharacter(name: string): Promise<string> {
  const c = await prisma.character.create({ data: { name: name || "Sans nom" } });
  revalidatePath("/");
  return c.id;
}

export async function createCharacterForm(formData: FormData): Promise<void> {
  const id = await createCharacter(String(formData.get("name") ?? ""));
  redirect(`/character/${id}`);
}

export async function updateCharacter(id: string, data: Record<string, unknown>): Promise<void> {
  await prisma.character.update({ where: { id }, data });
  revalidatePath(`/character/${id}`);
  revalidatePath("/");
  revalidatePath("/mj");
}

export async function deleteCharacter(id: string): Promise<void> {
  await prisma.character.delete({ where: { id } });
  revalidatePath("/");
}

export async function addItem(characterId: string, data: ItemInput): Promise<void> {
  await prisma.item.create({ data: { characterId, ...data } });
  revalidatePath(`/character/${characterId}`);
}

export async function updateItem(id: string, data: Partial<ItemInput>): Promise<void> {
  const item = await prisma.item.update({ where: { id }, data });
  revalidatePath(`/character/${item.characterId}`);
}

export async function deleteItem(id: string): Promise<void> {
  const item = await prisma.item.delete({ where: { id } });
  revalidatePath(`/character/${item.characterId}`);
}
