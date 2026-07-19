export const MAX_SLOTS = 10;

export function usedSlots(items: { slots: number }[], fatigue: number): number {
  return items.reduce((sum, i) => sum + i.slots, 0) + fatigue;
}

export function isOverloaded(items: { slots: number }[], fatigue: number): boolean {
  return usedSlots(items, fatigue) > MAX_SLOTS;
}

export function pettyItems<T extends { slots: number }>(items: T[]): T[] {
  return items.filter((i) => i.slots === 0);
}

export function slottedItems<T extends { slots: number }>(items: T[]): T[] {
  return items.filter((i) => i.slots > 0);
}
