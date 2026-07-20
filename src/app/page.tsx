import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "@/lib/auth";
import { LandingStart } from "@/components/LandingStart";
import { LandingVideo } from "@/components/LandingVideo";

// Landing publique — écran de démarrage façon jeu vidéo.
// Route publique. On lit le cookie de session juste pour personnaliser le
// bouton « Commencer » : connecté → entrée directe vers /table ; sinon → la
// modale de mot de passe s'ouvre sur place (voir LandingStart).
// `?login=1` (posé par le middleware ou /login pour les deep links) ouvre la
// modale automatiquement.
export default async function Landing({
  searchParams,
}: {
  searchParams: Promise<{ login?: string }>;
}) {
  const [jar, { login }] = await Promise.all([cookies(), searchParams]);
  const authed = await verifySession(jar.get(COOKIE_NAME)?.value);

  return (
    <main className="relative min-h-dvh overflow-hidden">
      {/* Fond cinématique — art direction : portrait sur mobile, paysage sur
          desktop. <picture> pour ne télécharger que l'image du viewport courant.
          L'image est la couche de base (rendu immédiat) ; LandingVideo pose la
          boucle vidéo par-dessus en fondu quand elle est prête. */}
      <picture>
        <source media="(min-width: 640px)" srcSet="/landing-desk.webp" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/landing.webp"
          alt=""
          aria-hidden
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-center scale-105"
        />
      </picture>
      <LandingVideo />
      {/* Assombrissement + vignette (image chaude : on garde l'ambiance).
          Ces voiles, et non la vidéo, sont ce qui rend la scène sombre : la
          vidéo et l'image de base sont à la même luminance (71,5 contre 72,5
          de moyenne, 1 % d'écart). Les alléger éclaircit donc les deux couches
          à l'identique, sans réencoder et sans créer de saut au fondu.
          Allégés une fois (55/35/80 → 38/18/66, vignette 0,6 → 0,45) : +33 % de
          luminance composite, contraste texte/fond mesuré à 6,4:1 au pire
          (sous-titre), très au-dessus du minimum AA de 4,5:1. */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/38 via-black/[.18] to-black/[.66]" />
      <div className="absolute inset-0 [background:radial-gradient(120%_85%_at_50%_42%,transparent_30%,rgba(0,0,0,0.45)_100%)]" />

      {/* Contenu centré */}
      <div className="relative z-10 flex min-h-dvh flex-col items-center px-6 pt-[19vh] pb-[11vh] text-center">
        <h1 className="font-cairn animate-in fade-in slide-in-from-bottom-3 duration-700 text-parch text-7xl leading-none drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] sm:text-8xl md:text-9xl">
          Cairn
        </h1>
        <p className="animate-in fade-in slide-in-from-bottom-2 delay-150 fill-mode-backwards duration-700 mt-4 text-sm uppercase tracking-[0.35em] text-parch/70 sm:text-base">
          Carnet de campagne
        </p>

        <div className="animate-in fade-in slide-in-from-bottom-2 delay-300 fill-mode-backwards duration-700 mt-auto">
          <LandingStart authed={authed} openLogin={!!login} />
        </div>
      </div>
    </main>
  );
}
