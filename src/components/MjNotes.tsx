"use client";
import { Plus, X } from "lucide-react";
import type { Note } from "@prisma/client";
import { createNote, deleteNote, updateNote } from "@/app/actions/notes";
import { useFieldSave } from "@/lib/use-field-save";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
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

function DeleteNoteButton({ note }: { note: Note }) {
  const hasContent = note.title.trim() !== "" || note.content.trim() !== "";
  const btn = (
    <Button
      variant="ghost"
      size="icon-sm"
      className="text-destructive hover:text-destructive shrink-0"
      aria-label="Supprimer la note"
      {...(hasContent ? {} : { onClick: () => deleteNote(note.id) })}
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
          <AlertDialogTitle>Supprimer cette note ?</AlertDialogTitle>
          <AlertDialogDescription>
            « {note.title || "Note sans titre"} » sera définitivement supprimée.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={() => deleteNote(note.id)}>Supprimer</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function MjNotes({ notes }: { notes: Note[] }) {
  const save = useFieldSave(
    Object.fromEntries(
      notes.flatMap((n) => [
        [`${n.id}.title`, n.title],
        [`${n.id}.content`, n.content],
      ]),
    ),
  );

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-cairn text-2xl text-moss">Notes secrètes</h2>
        <Button
          onClick={() => createNote()}
          size="sm"
          className="bg-moss text-moss-fg hover:bg-moss/90"
        >
          <Plus /> Nouvelle note
        </Button>
      </div>
      {notes.length === 0 && (
        <p className="text-sm text-muted-foreground">Aucune note pour l&apos;instant.</p>
      )}
      {notes.map((n) => (
        <Card key={n.id} className="p-3 gap-2">
          <div className="flex items-center gap-2">
            <Input
              defaultValue={n.title}
              onBlur={(e) =>
                save(`${n.id}.title`, e.target.value, () =>
                  updateNote(n.id, { title: e.target.value }),
                )
              }
              placeholder="Titre"
              className="flex-1 font-cairn text-lg h-9"
            />
            <DeleteNoteButton note={n} />
          </div>
          <Textarea
            defaultValue={n.content}
            onBlur={(e) =>
              save(`${n.id}.content`, e.target.value, () =>
                updateNote(n.id, { content: e.target.value }),
              )
            }
            rows={4}
            placeholder="Contenu…"
          />
        </Card>
      ))}
    </section>
  );
}
