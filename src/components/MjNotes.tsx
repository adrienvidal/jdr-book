"use client";
import type { Note } from "@prisma/client";
import { createNote, deleteNote, updateNote } from "@/app/actions/notes";

const cls = "rounded border px-2 py-1 bg-transparent";

export function MjNotes({ notes }: { notes: Note[] }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Notes secrètes</h2>
        <button
          onClick={() => createNote()}
          className="rounded bg-amber-700 text-white px-3 py-1 text-sm"
        >
          + Nouvelle note
        </button>
      </div>
      {notes.length === 0 && <p className="text-sm text-neutral-500">Aucune note.</p>}
      {notes.map((n) => (
        <div key={n.id} className="rounded border p-3 space-y-2">
          <div className="flex items-center gap-2">
            <input
              defaultValue={n.title}
              onBlur={(e) => updateNote(n.id, { title: e.target.value })}
              placeholder="Titre"
              className={`${cls} flex-1 font-semibold`}
            />
            <button
              onClick={() => deleteNote(n.id)}
              className="text-red-500 underline text-sm"
              aria-label="Supprimer la note"
            >
              ✕
            </button>
          </div>
          <textarea
            defaultValue={n.content}
            onBlur={(e) => updateNote(n.id, { content: e.target.value })}
            rows={4}
            placeholder="Contenu…"
            className={`${cls} w-full`}
          />
        </div>
      ))}
    </section>
  );
}
