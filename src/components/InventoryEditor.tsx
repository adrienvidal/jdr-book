"use client";
import type { Item } from "@prisma/client";
import { addItem, deleteItem, updateItem } from "@/app/actions/characters";
import {
  isOverloaded,
  MAX_SLOTS,
  pettyItems,
  slottedItems,
  usedSlots,
} from "@/lib/inventory";

const KINDS = ["arme", "armure", "equipement", "grimoire"];
const cls = "rounded border border-line bg-panel px-2 py-1";

function ItemRow({ item }: { item: Item }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b py-2 text-sm">
      <input
        defaultValue={item.name}
        onBlur={(e) => updateItem(item.id, { name: e.target.value })}
        placeholder="Nom"
        className={`${cls} flex-1 min-w-32`}
      />
      <select
        defaultValue={item.slots}
        onChange={(e) => updateItem(item.id, { slots: Number(e.target.value) })}
        className={cls}
      >
        <option value={0}>petty (0)</option>
        <option value={1}>normal (1)</option>
        <option value={2}>lourd (2)</option>
      </select>
      <select
        defaultValue={item.kind}
        onChange={(e) => updateItem(item.id, { kind: e.target.value })}
        className={cls}
      >
        {KINDS.map((k) => (
          <option key={k} value={k}>
            {k}
          </option>
        ))}
      </select>
      <input
        defaultValue={item.degats ?? ""}
        onBlur={(e) => updateItem(item.id, { degats: e.target.value || null })}
        placeholder="dégâts"
        className={`${cls} w-20`}
      />
      <input
        defaultValue={item.description}
        onBlur={(e) => updateItem(item.id, { description: e.target.value })}
        placeholder="description"
        className={`${cls} flex-1 min-w-32`}
      />
      <button
        onClick={() => deleteItem(item.id)}
        className="text-accent hover:opacity-80"
        aria-label="Supprimer l'objet"
      >
        ✕
      </button>
    </div>
  );
}

function AddItemForm({ characterId }: { characterId: string }) {
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    if (!name) return;
    await addItem(characterId, {
      name,
      slots: Number(data.get("slots") ?? 1),
      kind: String(data.get("kind") ?? "equipement"),
    });
    form.reset();
  }
  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-2 pt-3 text-sm">
      <input name="name" placeholder="Nouvel objet" className={`${cls} flex-1 min-w-32`} />
      <select name="slots" defaultValue={1} className={cls}>
        <option value={0}>petty (0)</option>
        <option value={1}>normal (1)</option>
        <option value={2}>lourd (2)</option>
      </select>
      <select name="kind" defaultValue="equipement" className={cls}>
        {KINDS.map((k) => (
          <option key={k} value={k}>
            {k}
          </option>
        ))}
      </select>
      <button className="rounded bg-accent text-accent-fg px-3 py-1 hover:opacity-90">Ajouter</button>
    </form>
  );
}

export function InventoryEditor({
  items,
  characterId,
  fatigue,
}: {
  items: Item[];
  characterId: string;
  fatigue: number;
}) {
  const used = usedSlots(items, fatigue);
  const over = isOverloaded(items, fatigue);
  const petty = pettyItems(items);
  const slotted = slottedItems(items);

  return (
    <section className="rounded-lg border border-line bg-panel/60 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="font-cairn text-xl">Inventaire</h2>
        <span className={`text-sm ${over ? "text-accent font-semibold" : "text-muted"}`}>
          {used} / {MAX_SLOTS} slots{fatigue > 0 ? ` (dont ${fatigue} fatigue)` : ""}
          {over ? " — surchargé !" : ""}
        </span>
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-wider font-semibold text-muted mt-2">
          Inventaire (1-10)
        </h3>
        {slotted.length === 0 && <p className="text-sm text-muted">Vide.</p>}
        {slotted.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-wider font-semibold text-muted mt-2">
          Petits Objets
        </h3>
        {petty.length === 0 && <p className="text-sm text-muted">Vide.</p>}
        {petty.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
      </div>

      <AddItemForm characterId={characterId} />
    </section>
  );
}
