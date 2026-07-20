"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Maximize, Play, Volume2, VolumeX, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

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
// Deux fondus, de durées très différentes, l'une et l'autre mesurées.
//
// À L'OUVERTURE, fondu court. Ces vidéos sont régénérées à partir du portrait
// fixe et en DÉRIVENT toujours un peu (30 à 33 dB selon les personnages) :
// visage légèrement différent, éléments animés déjà déplacés. Que cet écart se
// voie ou non dépend du mouvement du clip, qui peut le masquer — chez Coltar il
// passait inaperçu (écart plus faible que le mouvement d'une image), chez Lotus
// non, le clip y est quasi immobile au départ (48 dB entre deux images) et le
// changement de visage sauterait aux yeux. Un fondu court règle les deux cas
// sans réglage par vidéo : imperceptible quand les images sont proches,
// masquant quand elles divergent.
//
// À LA FIN, fondu long. Les clips terminent loin de leur portrait (10 à 14 dB),
// souvent sur un gros plan où le personnage n'est plus reconnaissable. Sans
// fondu, la fiche resterait figée sur cette image.
//
// DEUX COMMANDES INDÉPENDANTES. Play rejoue le clip SUR PLACE, dans le hero,
// avec le son ; un second bouton l'ouvre en grand dans une modale embarquée.
// Agrandir n'est pas une étape de la lecture mais un choix à part, offert au
// repos comme en cours de lecture.
//
// Modale et non plein écran natif : l'habillage reste celui de l'app et le
// comportement est identique sur tous les navigateurs — le plein écran natif
// d'iOS remplace la page par un lecteur système.
//
// La modale a SA PROPRE balise vidéo, plutôt que de déplacer celle du hero :
// React ne peut pas transporter un nœud d'un parent à l'autre sans le remonter,
// ce qui couperait la lecture. Le fichier étant déjà en cache après l'ouverture,
// ce second élément ne coûte pas un téléchargement.
//
// UNE SEULE OUVERTURE ANIMÉE PAR PORTRAIT ET PAR ONGLET. Revenir sur une fiche
// déjà vue ne relance plus la vidéo : l'animation présente le personnage, elle
// n'a pas à se rejouer à chaque aller-retour. Le drapeau est posé PAR CLIP —
// chaque portrait a droit à son ouverture — et vit dans `sessionStorage`, donc
// il survit aux navigations et au rafraîchissement, et se remet à zéro à la
// fermeture de l'onglet. Le bouton Play, lui, reste toujours disponible : le
// garde-fou ne concerne que le lancement automatique.
type Phase = "hidden" | "playing" | "fading";

const CLE = (videoSrc: string) => `portrait-anime-vu:${videoSrc}`;

// Habillage commun aux commandes posées sur une image : pastille sombre et
// floutée, lisible aussi bien sur un portrait clair que sur une vidéo sombre.
const COMMANDE =
  "rounded-full bg-black/40 p-3 text-parch backdrop-blur-sm transition hover:bg-black/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-parch/70";

// `sessionStorage` lève en navigation privée sur certains Safari, et son absence
// n'est pas un cas d'erreur ici : au pire l'animation se rejoue, ce qui était le
// comportement d'avant.
function dejaVu(videoSrc: string) {
  try {
    return sessionStorage.getItem(CLE(videoSrc)) !== null;
  } catch {
    return false;
  }
}

function marquerVu(videoSrc: string) {
  try {
    sessionStorage.setItem(CLE(videoSrc), "1");
  } catch {
    // sans mémoire, le garde-fou ne s'applique simplement pas
  }
}

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
  const [modale, setModale] = useState(false);

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
    if (dejaVu(videoSrc)) return;
    lire(false);
  }, [lire, videoSrc]);

  // Ouvrir la modale remet le hero au repos : deux lectures simultanées du même
  // clip, décalées et l'une muette, n'ont aucun intérêt.
  const ouvrirModale = () => {
    const video = ref.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    setPhase("hidden");
    setSonActif(false);
    // Regarder le clip en grand vaut l'avoir vu : sans ça, revenir sur la fiche
    // aussitôt après relancerait l'ouverture animée — exactement la redondance
    // que le garde-fou existe pour éviter.
    marquerVu(videoSrc);
    setModale(true);
  };

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
          //
          // Le portrait est marqué vu ICI, quand des images s'affichent
          // réellement, et non au montage : un autoplay refusé (Safari/iOS,
          // économie d'énergie) brûlerait sinon l'unique ouverture sans que rien
          // n'ait été montré.
          onPlaying={() => {
            setPhase("playing");
            marquerVu(videoSrc);
          }}
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
          className={`absolute inset-0 h-full w-full object-cover transition-opacity sepia-[.08] ${
            phase === "playing" ? "opacity-100 duration-300" : "opacity-0"
          } ${phase === "fading" ? "duration-[800ms]" : ""}`}
        />
      </div>

      {/* Commandes posées sur la bande floutée à droite du portrait : elles ne
          recouvrent jamais le personnage, ni la barre du haut, ni le nom en bas.
          Empilées et non côte à côte — la bande est étroite, et sur mobile deux
          boutons alignés déborderaient sur le visage.

          `z-10` n'est pas décoratif : les dégradés du hero sont posés après ces
          boutons dans le DOM et interceptent le pointeur. Sans ça, ils restent
          visibles mais deviennent inertes dès que le hero est assez court pour
          que le dégradé du bas remonte jusqu'à eux — c'est le cas de /mj. */}
      <div className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2 sm:right-6">
        {/* Deux rôles selon l'état plutôt que deux boutons concurrents : au repos
            elle relance dans le hero avec le son, en lecture elle pilote le son. */}
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
          className={COMMANDE}
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

        {/* Toujours offert, en lecture comme au repos : agrandir n'est pas une
            étape de la lecture, c'est un choix indépendant. */}
        <button
          type="button"
          onClick={ouvrirModale}
          aria-label={`Voir le portrait animé de ${alt} en grand`}
          className={COMMANDE}
        >
          <Maximize className="size-5" />
        </button>
      </div>

      <Dialog open={modale} onOpenChange={setModale}>
        {/* La modale occupe la fenêtre entière et laisse la vidéo se dimensionner
            seule en `object-contain` : le clip est vertical (9/16) et serait rogné
            par n'importe quel cadre imposé. Fond transparent et sans bordure — le
            voile de l'overlay suffit, un cadre autour d'une vidéo verticale ne
            ferait qu'ajouter des bandes. */}
        {/* `flex` et non la grille par défaut de DialogContent : dans une grille
            à pistes automatiques, le `max-h-full` de la vidéo se résout contre
            une piste dimensionnée par son contenu et ne contraint donc rien —
            mesuré, le clip débordait de la fenêtre en hauteur. */}
        <DialogContent
          className="flex h-dvh w-screen max-w-none items-center justify-center border-0 bg-transparent p-0 shadow-none"
          // Fermeture maison : celle de DialogContent est un × gris à 70 %
          // d'opacité, pensé pour un fond de carte clair. Sur une vidéo sombre
          // il disparaît.
          showClose={false}
        >
          <DialogTitle className="sr-only">Portrait animé de {alt}</DialogTitle>
          <button
            type="button"
            onClick={() => setModale(false)}
            aria-label="Fermer"
            className={`absolute right-3 top-3 z-10 sm:right-6 sm:top-6 ${COMMANDE}`}
          >
            <X className="size-5" />
          </button>
          {modale && (
            <video
              src={videoSrc}
              autoPlay
              controls
              playsInline
              // Le clic vient d'un geste utilisateur : la lecture sonore ne peut
              // pas être bloquée ici, contrairement à l'ouverture de la fiche.
              onEnded={() => setModale(false)}
              className="max-h-full max-w-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
