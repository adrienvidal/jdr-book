"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function listNotes() {
  return prisma.note.findMany({ orderBy: { updatedAt: "desc" } });
}

export async function createNote(): Promise<void> {
  await prisma.note.create({ data: {} });
  revalidatePath("/mj");
}

export async function updateNote(
  id: string,
  data: { title?: string; content?: string },
): Promise<void> {
  await prisma.note.update({ where: { id }, data });
  revalidatePath("/mj");
}

export async function deleteNote(id: string): Promise<void> {
  await prisma.note.delete({ where: { id } });
  revalidatePath("/mj");
}
