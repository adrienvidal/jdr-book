"use client";
import type { Note } from "@prisma/client";
import { createNote, deleteNote, updateNote } from "@/app/actions/notes";

const cls = "rounded border border-line bg-panel px-2 py-1";

export function MjNotes({ notes }: { notes: Note[] }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-cairn text-2xl text-moss">Notes secrètes</h2>
        <button
          onClick={() => createNote()}
          className="rounded bg-moss text-accent-fg px-3 py-1 text-sm hover:opacity-90"
        >
          + Nouvelle note
        </button>
      </div>
      {notes.length === 0 && <p className="text-sm text-muted">Aucune note.</p>}
      {notes.map((n) => (
        <div key={n.id} className="rounded-lg border border-line bg-panel/60 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <input
              defaultValue={n.title}
              onBlur={(e) => updateNote(n.id, { title: e.target.value })}
              placeholder="Titre"
              className={`${cls} flex-1 font-cairn text-lg`}
            />
            <button
              onClick={() => deleteNote(n.id)}
              className="text-accent hover:opacity-80 text-sm"
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
