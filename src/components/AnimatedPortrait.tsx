"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Play, Volume2, VolumeX } from "lucide-react";

// Portrait animé du hero de fiche : la vidéo se joue une fois à l'ouverture,
// puis se fond vers le portrait fixe, qui reste l'état de repos.
//
// Même contrat que LandingVideo : l'image est la COUCHE DE BASE, la vidéo une
// amélioration posée par-dessus. Autoplay refusé, erreur réseau, mouvement
// réduit — tout retombe sur l'image sans code dédié.
//
// SON STRICTEMENT SUR DEMANDE. L'ouverture est toujours muette, quel que soit
// le navigateur : une fiche consultée autour d'une table ne doit pas se mettre
// à faire du bruit toute seule. C'est aussi le seul comportement prévisible —
// l'autoplay sonore n'est autorisé qu'après un geste dans le document, donc il
// passerait depuis /table (navigation client, le clic sur la carte compte) mais
// serait refusé sur un lien direct, un rafraîchissement ou un retour d'historique.
// Un clic étant un geste, la lecture sonore demandée ici n'est jamais bloquée.
//
// Deux asymétries mesurées sur la vidéo de Coltar, qui expliquent le traitement
// visuel :
// - à l'ouverture, l'écart entre le portrait fixe et la 1re image de la vidéo
//   (31,8 dB) est PLUS FAIBLE que le mouvement d'une image du clip (28,1 dB) :
//   la bascule est moins visible qu'un battement de la vidéo → échange sec,
//   sans transition, qui serait un fondu vers rien ;
// - à la fin, le clip termine en gros plan sur la hache (12,6 dB par rapport au
//   portrait) : sans fondu, la fiche resterait sur une image où le personnage
//   n'est pas reconnaissable → fondu long, qui masque le saut.
type Phase = "hidden" | "playing" | "fading";

export function AnimatedPortrait({
  videoSrc,
  imageUrl,
  alt,
}: {
  videoSrc: string;
  imageUrl: string;
  alt: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<Phase>("hidden");
  const [sonActif, setSonActif] = useState(false);

  // La source n'est posée qu'au moment de lire : sous mouvement réduit et tant
  // que personne n'a cliqué, aucun octet n'est téléchargé.
  const lire = useCallback(
    (avecSon: boolean) => {
      const video = ref.current;
      if (!video) return;
      if (!video.src) video.src = videoSrc;
      video.muted = !avecSon;
      setSonActif(avecSon);
      // Au tout premier appel rien n'est encore chargé : `currentTime` n'a pas
      // de sens et le clip démarre de toute façon à zéro.
      if (video.readyState > 0) video.currentTime = 0;
      // Safari/iOS peuvent refuser l'autoplay malgré `muted` : on ignore, l'image
      // reste affichée et le bouton reste offert.
      void video.play().catch(() => {});
    },
    [videoSrc],
  );

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    lire(false);
  }, [lire]);

  const basculerSon = () => {
    const video = ref.current;
    if (!video) return;
    video.muted = sonActif;
    setSonActif(!sonActif);
  };

  const enLecture = phase === "playing";

  return (
    <>
      {/* Portrait net, non rogné, centré */}
      <div className="absolute inset-y-0 left-1/2 aspect-[9/16] -translate-x-1/2">
        <Image
          src={imageUrl}
          alt={alt}
          fill
          priority
          sizes="(max-width: 640px) 60vw, 300px"
          className="object-cover sepia-[.08]"
        />
        <video
          ref={ref}
          // Piloté par l'état ET posé impérativement avant chaque `play()` :
          // l'état seul arriverait trop tard (mise à jour asynchrone) et la
          // lecture partirait avec la mauvaise valeur ; l'impératif seul se
          // ferait écraser par React au rendu suivant. Les deux concordent.
          muted={!sonActif}
          playsInline
          preload="none"
          aria-hidden
          tabIndex={-1}
          // `playing` et non `canplay` : il se redéclenche à chaque rejeu, alors
          // que `canplay` ne se produit qu'au premier chargement.
          onPlaying={() => setPhase("playing")}
          onEnded={() => setPhase("fading")}
          onTransitionEnd={() =>
            setPhase((p) => {
              if (p !== "fading") return p;
              // Fondu terminé : état de repos, et le clip est réarmé sur sa
              // première image pour qu'un rejeu reparte proprement.
              if (ref.current) ref.current.currentTime = 0;
              return "hidden";
            })
          }
          className={`absolute inset-0 h-full w-full object-cover sepia-[.08] ${
            phase === "playing" ? "opacity-100" : "opacity-0"
          } ${phase === "fading" ? "transition-opacity duration-[800ms]" : ""}`}
        />
      </div>

      {/* Commande unique, posée sur la bande floutée à droite du portrait : ne
          recouvre jamais le personnage, ni la barre du haut, ni le nom en bas.
          Deux rôles selon l'état, plutôt que deux boutons concurrents — au
          repos elle relance, en lecture elle pilote le son. */}
      <button
        type="button"
        onClick={enLecture ? basculerSon : () => lire(true)}
        aria-label={
          enLecture
            ? sonActif
              ? "Couper le son"
              : "Activer le son"
            : `Rejouer le portrait animé de ${alt}, avec le son`
        }
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-3 text-parch backdrop-blur-sm transition hover:bg-black/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-parch/70 sm:right-6"
      >
        {enLecture ? (
          sonActif ? (
            <Volume2 className="size-5" />
          ) : (
            <VolumeX className="size-5" />
          )
        ) : (
          <Play className="size-5 fill-current" />
        )}
      </button>
    </>
  );
}
