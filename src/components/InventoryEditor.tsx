"use client";
import { Plus, X } from "lucide-react";
import type { Item } from "@prisma/client";
import { addItem, deleteItem, updateItem } from "@/app/actions/characters";
import {
  isOverloaded,
  MAX_SLOTS,
  pettyItems,
  slottedItems,
  usedSlots,
} from "@/lib/inventory";
import { useFieldSave } from "@/lib/use-field-save";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const KINDS = ["arme", "armure", "equipement", "grimoire"];
const selectCls =
  "h-9 rounded-md border border-input bg-transparent px-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function DeleteItemButton({ item }: { item: Item }) {
  const hasContent = item.name.trim() !== "" || item.description.trim() !== "";
  const btn = (
    <Button
      variant="ghost"
      size="icon-sm"
      className="text-destructive hover:text-destructive shrink-0"
      aria-label="Supprimer l'objet"
      {...(hasContent ? {} : { onClick: () => deleteItem(item.id) })}
    >
      <X />
    </Button>
  );

  if (!hasContent) return btn;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{btn}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Retirer cet objet ?</AlertDialogTitle>
          <AlertDialogDescription>
            « {item.name || "Objet"} » sera retiré de l&apos;inventaire.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={() => deleteItem(item.id)}>Retirer</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ItemRow({ item, save }: { item: Item; save: ReturnType<typeof useFieldSave> }) {
  const k = (field: string) => `${item.id}.${field}`;
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-line/70 py-2 text-sm">
      <Input
        defaultValue={item.name}
        onBlur={(e) => save(k("name"), e.target.value, () => updateItem(item.id, { name: e.target.value }))}
        placeholder="Nom"
        className="flex-1 min-w-32 h-9"
      />
      <select
        defaultValue={item.slots}
        onChange={(e) =>
          save(k("slots"), Number(e.target.value), () =>
            updateItem(item.id, { slots: Number(e.target.value) }),
          )
        }
        aria-label="Encombrement"
        className={selectCls}
      >
        <option value={0}>petty (0)</option>
        <option value={1}>normal (1)</option>
        <option value={2}>lourd (2)</option>
      </select>
      <select
        defaultValue={item.kind}
        onChange={(e) =>
          save(k("kind"), e.target.value, () => updateItem(item.id, { kind: e.target.value }))
        }
        aria-label="Type"
        className={selectCls}
      >
        {KINDS.map((kind) => (
          <option key={kind} value={kind}>
            {kind}
          </option>
        ))}
      </select>
      <Input
        defaultValue={item.degats ?? ""}
        onBlur={(e) =>
          save(k("degats"), e.target.value, () =>
            updateItem(item.id, { degats: e.target.value || null }),
          )
        }
        placeholder="dégâts"
        className="w-20 h-9"
      />
      <Input
        defaultValue={item.description}
        onBlur={(e) =>
          save(k("description"), e.target.value, () =>
            updateItem(item.id, { description: e.target.value }),
          )
        }
        placeholder="description"
        className="flex-1 min-w-32 h-9"
      />
      <DeleteItemButton item={item} />
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
      <Input name="name" placeholder="Nouvel objet" className="flex-1 min-w-32 h-9" />
      <select name="slots" defaultValue={1} aria-label="Encombrement" className={selectCls}>
        <option value={0}>petty (0)</option>
        <option value={1}>normal (1)</option>
        <option value={2}>lourd (2)</option>
      </select>
      <select name="kind" defaultValue="equipement" aria-label="Type" className={selectCls}>
        {KINDS.map((k) => (
          <option key={k} value={k}>
            {k}
          </option>
        ))}
      </select>
      <Button type="submit" size="sm">
        <Plus /> Ajouter
      </Button>
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

  const save = useFieldSave(
    Object.fromEntries(
      items.flatMap((it) => [
        [`${it.id}.name`, it.name],
        [`${it.id}.slots`, it.slots],
        [`${it.id}.kind`, it.kind],
        [`${it.id}.degats`, it.degats ?? ""],
        [`${it.id}.description`, it.description],
      ]),
    ),
  );

  return (
    <section className="rounded-lg border border-line bg-card/60 p-3 sm:p-4 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-cairn text-xl">Inventaire</h2>
        <div className="flex items-center gap-2 text-sm">
          <span className={over ? "text-destructive font-semibold" : "text-muted-foreground"}>
            {used} / {MAX_SLOTS} slots{fatigue > 0 ? ` (dont ${fatigue} fatigue)` : ""}
          </span>
          {over && <Badge variant="destructive">Surchargé</Badge>}
        </div>
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mt-2">
          Inventaire (1-10)
        </h3>
        {slotted.length === 0 && <p className="text-sm text-muted-foreground">Vide.</p>}
        {slotted.map((item) => (
          <ItemRow key={item.id} item={item} save={save} />
        ))}
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mt-2">
          Petits Objets
        </h3>
        {petty.length === 0 && <p className="text-sm text-muted-foreground">Vide.</p>}
        {petty.map((item) => (
          <ItemRow key={item.id} item={item} save={save} />
        ))}
      </div>

      <AddItemForm characterId={characterId} />
    </section>
  );
}
