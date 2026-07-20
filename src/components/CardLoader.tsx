"use client";

import { useLinkStatus } from "next/link";
import { Loader2 } from "lucide-react";

// Témoin de navigation posé DANS une carte de /table. `useLinkStatus` ne
// renseigne que sur le <Link> qui l'englobe : chaque carte a donc son propre
// état, sans qu'aucune n'ait à savoir ce que font les autres.
//
// Utile ici parce que les fiches sont des routes dynamiques sans `loading.js` :
// entre le clic et l'affichage, rien ne bougeait à l'écran.
//
// Le délai à l'apparition n'est pas cosmétique : une carte préchargée s'ouvre
// en quelques millisecondes, et sans lui le témoin ferait un clignotement à
// chaque clic — plus perturbant que l'absence d'indicateur. Il n'apparaît donc
// que si la navigation dure assez pour se faire attendre. Au retour, pas de
// délai : l'arrivée de la page doit l'effacer aussitôt.
export function CardLoader() {
  const { pending } = useLinkStatus();

  return (
    <span
      aria-hidden
      className={`absolute left-2 top-2 rounded-full bg-black/50 p-1.5 text-parch backdrop-blur-sm transition-opacity ${
        pending ? "opacity-100 delay-150 duration-200" : "opacity-0 duration-100"
      }`}
    >
      <Loader2 className="size-4 animate-spin" />
    </span>
  );
}
