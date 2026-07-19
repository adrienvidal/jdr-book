import { beforeEach, expect, test, vi } from "vitest";
import { revalidatePath } from "next/cache";

// Régression : après le déplacement du dashboard de `/` vers `/table`, les
// mutations de personnage doivent revalider `/table` (la liste), sinon la page
// statique reste figée et les changements « disparaissent » de la liste.

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    character: {
      create: vi.fn().mockResolvedValue({ id: "c1" }),
      update: vi.fn().mockResolvedValue({ id: "c1" }),
      delete: vi.fn().mockResolvedValue({ id: "c1" }),
    },
  },
}));

import { createCharacter, updateCharacter, deleteCharacter } from "@/app/actions/characters";

const revalidateMock = vi.mocked(revalidatePath);

beforeEach(() => revalidateMock.mockClear());

test("updateCharacter revalide la liste /table", async () => {
  await updateCharacter("c1", { name: "Bran" });
  expect(revalidateMock).toHaveBeenCalledWith("/table");
});

test("createCharacter revalide les listes /table et /mj", async () => {
  await createCharacter("Bran");
  expect(revalidateMock).toHaveBeenCalledWith("/table");
  expect(revalidateMock).toHaveBeenCalledWith("/mj");
});

test("deleteCharacter revalide les listes /table et /mj", async () => {
  await deleteCharacter("c1");
  expect(revalidateMock).toHaveBeenCalledWith("/table");
  expect(revalidateMock).toHaveBeenCalledWith("/mj");
});
