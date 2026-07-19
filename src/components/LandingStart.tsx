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

const START_CLASSES = "px-10 py-6 text-lg shadow-xl shadow-black/40";

// Bouton « Commencer » de la landing.
// - Déjà connecté : lien direct vers /table (entrée immédiate).
// - Sinon : ouvre une modale de mot de passe sans quitter la landing.
export function LandingStart({ authed }: { authed: boolean }) {
  if (authed) {
    return (
      <Button asChild size="lg" className={START_CLASSES}>
        <Link href="/table">Commencer</Link>
      </Button>
    );
  }
  return <LoginDialog />;
}

function LoginDialog() {
  const [state, formAction] = useActionState<LoginState, FormData>(loginAppAction, {
    error: false,
  });

  return (
    <Dialog>
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
