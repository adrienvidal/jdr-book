"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useCallback, useEffect, useRef, useState } from "react";
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
// `h-14` explicite : `size="lg"` pose `h-9` et l'ancien `py-6` posait une
// hauteur concurrente, la taille rendue ne tenait qu'à l'ordre des classes.
// Une seule source de hauteur, et 56px passent la cible tactile de 44px.
// Le relief et l'ombre viennent de `.btn-wax` (voir globals.css).
const START_CLASSES =
  "btn-wax focus-ring-parch h-14 px-10 text-lg tracking-[0.04em] focus-visible:ring-parch/40";

// Source de la vidéo d'ouverture selon le viewport, comme la boucle de fond :
// paysage sur desktop, portrait sur mobile. L'attribut `media` de <source>
// n'étant pas honoré dans <video>, on choisit ici pour ne charger qu'une seule
// source. À n'appeler que côté client (matchMedia).
function startVideoSrc() {
  return window.matchMedia("(min-width: 640px)").matches
    ? "/landing-desk-start.mp4"
    : "/landing-mobile-start.mp4";
}

// Effacement du bloc du bas, puis fondu vers /table. Deux durées, deux rôles :
// on ne les confond pas dans une constante commune.
const CLEAR_MS = 450;
const LEAVE_MS = 550;

type Phase = "idle" | "clearing" | "playing" | "leaving";

// Bloc du bas de la landing : le bouton « Commencer », la signature, et la
// cérémonie d'entrée qu'ils déclenchent.
//
// Séquence : clic → (mot de passe si besoin) → le bouton et la signature
// s'effacent → la vidéo d'ouverture couvre l'écran → à la fin, fondu vers le
// parchemin de /table.
//
// Le bloc entier vit ici parce que la séquence le fait disparaître d'un seul
// tenant : le découper entre serveur et client obligerait à faire remonter
// l'état de phase.
export function LandingEnter({
  authed,
  openLogin = false,
}: {
  authed: boolean;
  openLogin?: boolean;
}) {
  const router = useRouter();
  const video = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [open, setOpen] = useState(openLogin);
  const [state, formAction] = useActionState<LoginState, FormData>(loginAppAction, {
    error: false,
  });

  // Le mot de passe accepté pose un cookie, et Next rafraîchit alors l'arbre
  // serveur : `authed` repasse à true en pleine cérémonie. On fige la valeur
  // du premier rendu, sinon la branche du bouton bascule sous l'utilisateur —
  // et la modale, démontée dans la foulée, emporterait avec elle le signal de
  // succès. C'est pour la même raison que `useActionState` vit ici et non
  // dans la modale : l'écoute du succès doit survivre à la modale.
  const [wasAuthed] = useState(authed);

  // Précharge à l'intention (survol, focus, ouverture de la modale) plutôt
  // qu'au montage : la boucle de fond télécharge déjà, inutile d'y ajouter
  // 900 Ko pour un visiteur qui ne fait que regarder.
  const arm = useCallback(() => {
    const el = video.current;
    if (el && !el.src) el.src = startVideoSrc();
    router.prefetch("/table");
  }, [router]);

  const leave = useCallback(() => {
    setPhase("leaving");
    setTimeout(() => router.push("/table"), LEAVE_MS);
  }, [router]);

  const begin = useCallback(() => {
    // « Réduire les animations » : pas de cérémonie, on entre directement.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      router.push("/table");
      return;
    }
    arm();
    setPhase("clearing");
    setTimeout(() => setPhase("playing"), CLEAR_MS);
  }, [arm, router]);

  // Mot de passe accepté : la modale se referme et la cérémonie prend la
  // suite. L'action ne redirige plus elle-même, justement pour laisser la
  // vidéo se jouer avant /table.
  useEffect(() => {
    if (!state.ok) return;
    setOpen(false);
    begin();
  }, [state.ok, begin]);

  useEffect(() => {
    if (phase !== "playing") return;
    const el = video.current;
    if (!el) return;

    // Autoplay refusé, décodage en échec : on n'abandonne pas l'utilisateur
    // devant un écran figé, on entre.
    void el.play().catch(leave);

    // Même filet pour un flux qui cale : `ended` ne viendrait jamais.
    const budget = ((Number.isFinite(el.duration) && el.duration) || 5) * 1000 + 3000;
    const stall = setTimeout(leave, budget);
    return () => clearTimeout(stall);
  }, [phase, leave]);

  const gone = phase !== "idle";

  return (
    <>
      <div
        className={`transition-opacity duration-[450ms] ${gone ? "pointer-events-none opacity-0" : "opacity-100"}`}
        // Une fois la séquence lancée, le bloc n'est plus une cible : ni au
        // clavier, ni pour un lecteur d'écran qui le lirait par-dessus la vidéo.
        inert={gone || undefined}
      >
        {wasAuthed ? (
          <Button asChild size="lg" className={START_CLASSES}>
            {/* Reste un vrai lien : clic milieu, « ouvrir dans un onglet » et
                prefetch continuent de marcher. Le clic simple joue la vidéo. */}
            <Link
              href="/table"
              onPointerEnter={arm}
              onFocus={arm}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                e.preventDefault();
                begin();
              }}
            >
              Commencer
            </Link>
          </Button>
        ) : (
          <LoginDialog
            open={open}
            onOpenChange={(next) => {
              if (next) arm();
              setOpen(next);
            }}
            state={state}
            formAction={formAction}
            onArm={arm}
          />
        )}
        {/* Signature discrète : assez lisible pour être lue, assez effacée
            pour ne pas disputer l'attention au bouton juste au-dessus.
            Opacité mesurée sur le rendu réel, pas calculée : à 11 px
            l'antialiasing dilue les glyphes, si bien que le contraste perçu
            tombe bien sous le calcul théorique (/55 calculait 5,0:1 mais ne
            mesurait que 3,66:1 à l'écran). /70 est l'opacité qui passe AA
            une fois rendue. Baisser cette valeur redemande une mesure. */}
        <p className="mt-6 text-[11px] tracking-wide text-parch/70">
          Site réalisé par{" "}
          <a
            href="https://viloris.io"
            target="_blank"
            rel="noreferrer"
            className="focus-ring-parch rounded-sm underline underline-offset-2 transition-colors hover:text-parch"
          >
            Viloris.io
          </a>
        </p>
      </div>

      {/* Vidéo d'ouverture : plein cadre, par-dessus toute la landing.
          Montée en fondu pour ne pas couper net sur le titre.
          `scale-105` comme la boucle de fond et l'image de base : la vidéo
          d'ouverture est cadrée à l'identique de la boucle, sans cette même
          échelle le fondu passerait de 105 % à 100 % — un dézoom visible. */}
      <video
        ref={video}
        muted
        playsInline
        preload="none"
        aria-hidden
        tabIndex={-1}
        onEnded={leave}
        onError={() => {
          if (phase === "clearing" || phase === "playing") leave();
        }}
        className={`fixed inset-0 z-40 h-full w-full scale-105 object-cover object-center transition-opacity duration-500 ${
          phase === "playing" || phase === "leaving"
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Fondu de sortie vers le parchemin — la couleur de fond de /table, si
          bien que le voile ne se lève pas sur un saut de couleur : seul le
          contenu de la table apparaît. */}
      <div
        aria-hidden
        className={`bg-background pointer-events-none fixed inset-0 z-50 transition-opacity duration-[550ms] ${
          phase === "leaving" ? "opacity-100" : "opacity-0"
        }`}
      />
    </>
  );
}

// Modale de mot de passe — présentation seule. L'état de connexion et l'écoute
// du succès vivent dans LandingEnter, qui survit au rafraîchissement RSC que
// déclenche la pose du cookie.
function LoginDialog({
  open,
  onOpenChange,
  state,
  formAction,
  onArm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state: LoginState;
  formAction: (formData: FormData) => void;
  onArm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className={START_CLASSES} onPointerEnter={onArm}>
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
