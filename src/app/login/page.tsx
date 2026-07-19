import { redirect } from "next/navigation";

// La connexion se fait désormais via la modale de la landing.
// Cette route ne sert plus que de filet (deep links, anciens favoris) : on
// renvoie vers la landing avec la modale de mot de passe déjà ouverte.
export default function LoginRedirect() {
  redirect("/?login=1");
}
