import Link from "next/link";
import { createCharacterForm } from "@/app/actions/characters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/SubmitButton";

export default function NewCharacter() {
  return (
    <main className="min-h-screen grid place-items-center p-4 sm:p-6">
      <Card className="w-full max-w-sm border-2 bg-card/70">
        <CardHeader className="text-center">
          <CardTitle className="font-cairn text-3xl">Nouveau personnage</CardTitle>
          <p className="text-muted-foreground text-sm">Donnez-lui un nom pour commencer</p>
        </CardHeader>
        <CardContent>
          <form action={createCharacterForm} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nom</Label>
              <Input id="name" name="name" placeholder="Nom du personnage" autoFocus required />
            </div>
            <SubmitButton className="w-full" pendingLabel="Création…">
              Créer
            </SubmitButton>
            <Link
              href="/"
              className="block text-center text-sm text-muted-foreground hover:text-primary underline"
            >
              ← Retour à l&apos;accueil
            </Link>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
