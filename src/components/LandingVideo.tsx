"use client";

import { useEffect, useRef, useState } from "react";

// Boucle vidéo de fond de la landing, superposée en fondu au <picture> de la
// page. L'image reste donc la couche de base : premier rendu instantané, et
// toute dégradation (mouvement réduit, autoplay refusé, erreur réseau) se
// contente de laisser l'image en place — jamais d'écran vide.
export function LandingVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    // « Réduire les animations » : on ne charge même pas la vidéo.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // L'attribut `media` de <source> n'est pas honoré dans <video> (contrairement
    // à <picture>) : on choisit donc la source ici, pour ne télécharger que
    // celle du viewport courant.
    video.src = window.matchMedia("(min-width: 640px)").matches
      ? "/landing-desk.mp4"
      : "/landing-mobile.mp4";

    // Safari/iOS peuvent refuser l'autoplay malgré `muted` : on ignore, l'image
    // reste affichée.
    void video.play().catch(() => {});
  }, []);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
      tabIndex={-1}
      onCanPlay={() => setReady(true)}
      className={`absolute inset-0 h-full w-full scale-105 object-cover object-center transition-opacity duration-1000 ${
        ready ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
