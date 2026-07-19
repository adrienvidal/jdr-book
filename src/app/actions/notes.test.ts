import { afterAll, expect, test, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: () => {} }));

import { prisma } from "@/lib/prisma";
import { createNote, deleteNote, listNotes, updateNote } from "@/app/actions/notes";

test("cycle de vie d'une note", async () => {
  const before = (await listNotes()).length;
  await createNote();
  const notes = await listNotes();
  expect(notes.length).toBe(before + 1);
  const n = notes[0];
  await updateNote(n.id, { title: "Complot", content: "Le baron ment." });
  await deleteNote(n.id);
  expect((await listNotes()).length).toBe(before);
});

afterAll(() => prisma.$disconnect());
