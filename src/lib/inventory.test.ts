import { expect, test } from "vitest";
import { isOverloaded, pettyItems, slottedItems, usedSlots, MAX_SLOTS } from "@/lib/inventory";

const items = [
  { slots: 0, name: "dague de poche" },
  { slots: 1, name: "épée" },
  { slots: 2, name: "armure lourde" },
];

test("usedSlots somme les slots + la fatigue", () => {
  expect(usedSlots(items, 0)).toBe(3);
  expect(usedSlots(items, 2)).toBe(5);
});

test("isOverloaded au-delà de 10", () => {
  expect(MAX_SLOTS).toBe(10);
  expect(isOverloaded(items, 6)).toBe(false); // 3 + 6 = 9
  expect(isOverloaded(items, 8)).toBe(true); // 3 + 8 = 11
});

test("séparation petits objets / inventaire", () => {
  expect(pettyItems(items).map((i) => i.name)).toEqual(["dague de poche"]);
  expect(slottedItems(items).map((i) => i.name)).toEqual(["épée", "armure lourde"]);
});
