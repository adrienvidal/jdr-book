"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAppAction, type LoginState } from "@/app/actions/session";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/SubmitButton";

// `focus-ring-parch` : le bouton est rouille sur une scène nocturne, et
// l'anneau de focus par défaut est rouille lui aussi — invisible des deux
// côtés du bord. Sur la landing seulement, l'anneau passe au parchemin.
const START_CLASSES = "focus-ring-parch px-10 py-6 text-lg shadow-xl shadow-black/40";

// Bouton « Commencer » de la landing.
// - Déjà connecté : lien direct vers /table (entrée immédiate).
// - Sinon : ouvre une modale de mot de passe sans quitter la landing.
//   `openLogin` (deep link `?login=1`) ouvre la modale d'emblée.
export function LandingStart({
  authed,
  openLogin = false,
}: {
  authed: boolean;
  openLogin?: boolean;
}) {
  if (authed) {
    return (
      <Button asChild size="lg" className={START_CLASSES}>
        <Link href="/table">Commencer</Link>
      </Button>
    );
  }
  return <LoginDialog defaultOpen={openLogin} />;
}

function LoginDialog({ defaultOpen }: { defaultOpen: boolean }) {
  const [state, formAction] = useActionState<LoginState, FormData>(loginAppAction, {
    error: false,
  });

  return (
    <Dialog defaultOpen={defaultOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className={START_CLASSES}>
          Commencer
        </Button>
      </DialogTrigger>
      <DialogContent className="text-center">
        <DialogTitle className="text-center">Cairn</DialogTitle>
        <DialogDescription className="text-center">
          Entrez pour rejoindre la table
        </DialogDescription>
        <form action={formAction} className="mt-2 space-y-4 text-left">
          <div className="space-y-1.5">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Mot de passe"
              autoFocus
              suppressHydrationWarning
              aria-invalid={state.error}
            />
            {state.error && (
              <p className="text-destructive text-sm" role="alert">
                Mot de passe incorrect.
              </p>
            )}
          </div>
          <SubmitButton className="w-full" pendingLabel="Ouverture…">
            Entrer
          </SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
