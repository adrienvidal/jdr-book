import { afterAll, expect, test, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: () => {} }));

import { prisma } from "@/lib/prisma";
import {
  addItem,
  createCharacter,
  deleteCharacter,
  getCharacter,
  updateCharacter,
} from "@/app/actions/characters";

const created: string[] = [];
afterAll(async () => {
  await prisma.character.deleteMany({ where: { id: { in: created } } });
  await prisma.$disconnect();
});

test("cycle de vie d'un personnage", async () => {
  const id = await createCharacter("Bran");
  created.push(id);
  await updateCharacter(id, { force: 12, pv: 4, pvMax: 4 });
  await addItem(id, { name: "épée", slots: 1, kind: "arme", degats: "d6" });
  const c = await getCharacter(id);
  expect(c?.name).toBe("Bran");
  expect(c?.force).toBe(12);
  expect(c?.items).toHaveLength(1);
  await deleteCharacter(id);
  expect(await getCharacter(id)).toBeNull();
});
