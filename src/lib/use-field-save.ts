"use client";
import { useRef } from "react";
import { toast } from "sonner";

/**
 * Sauvegarde onBlur/onChange avec dédup + toast discret.
 * - Ne persiste (et ne toast) que si la valeur a changé depuis la dernière sauvegarde.
 * - Un seul toast à la fois (id partagé), pour ne pas empiler pendant l'édition.
 */
export function useFieldSave(initial: Record<string, unknown> = {}) {
  const last = useRef<Record<string, unknown>>({ ...initial });

  return function save(field: string, value: unknown, persist: () => unknown) {
    if (Object.is(last.current[field], value)) return;
    last.current[field] = value;
    Promise.resolve(persist()).then(
      () => toast.success("Enregistré", { id: "cairn-save", duration: 1400 }),
      () => toast.error("Échec de l'enregistrement", { id: "cairn-save" }),
    );
  };
}
