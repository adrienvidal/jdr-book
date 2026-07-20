// Portraits animés, associés à la main par un développeur.
//
// Volontairement en code plutôt qu'en base : l'association est versionnée avec
// la vidéo qu'elle désigne, et ajouter un personnage animé ne demande ni
// migration ni champ de formulaire. Le jour où quelqu'un d'autre qu'un dev doit
// pouvoir en poser une, ceci devient une colonne `videoUrl` et un upload.
//
// Pour en ajouter une : encoder la source (voir la chaîne ci-dessous), déposer
// le fichier dans `public/portraits/`, ajouter une ligne ici.
//
//   ffmpeg -i docs/<nom>.mp4 -an -c:v libx264 -crf 28 -preset slow \
//     -pix_fmt yuv420p -movflags +faststart public/portraits/<nom>.mp4
//
// Contraintes vérifiées sur Coltar, à revérifier pour toute nouvelle vidéo :
// - cadrage vertical ~9/16, pour occuper le même créneau que le portrait fixe ;
// - la vidéo DÉMARRE sur le portrait fixe du personnage, sinon l'ouverture saute
//   (mesuré : l'écart image → 1re image doit rester inférieur au mouvement d'une
//   image du clip, sans quoi il faut un fondu à l'ouverture) ;
// - pas d'agrandissement à l'écran : viser au moins 1248 px de haut, la demande
//   du pire cas (mobile à DPR 3). En deçà, l'image serait plus nette que la vidéo.
export const ANIMATED_PORTRAITS: Record<string, string> = {
  // Coltar le silencieux
  cmrrrjuf800000nat4wjcfidn: "/portraits/coltar.mp4",
};
