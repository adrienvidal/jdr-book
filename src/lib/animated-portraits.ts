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
// Contraintes à respecter pour toute nouvelle vidéo :
// - cadrage vertical ~9/16, pour occuper le même créneau que le portrait fixe ;
// - même CADRAGE que le portrait fixe au démarrage. La vidéo n'a pas à en être
//   une copie exacte — le fondu d'ouverture absorbe la dérive de régénération,
//   qui est systématique — mais un recadrage franc, lui, se verrait ;
// - pas d'agrandissement à l'écran : viser au moins 1248 px de haut, la demande
//   du pire cas (mobile à DPR 3). En deçà, l'image serait plus nette que la vidéo.
//
// Vérifié sur les cinq vidéos : pire image entre 37,6 et 39,1 dB à l'échelle
// d'affichage réelle. Si une nouvelle descend nettement sous 37 dB, remesurer
// avant de la livrer.
//
// Le nom du fichier désigne le PERSONNAGE, pas la prise : une nouvelle version
// écrase la précédente au même chemin. Sans risque de cache — Vercel sert les
// fichiers de public/ en « max-age=0, must-revalidate » avec etag (vérifié),
// donc le navigateur revalide à chaque requête.
export const ANIMATED_PORTRAITS: Record<string, string> = {
  // Coltar le silencieux
  cmrrrjuf800000nat4wjcfidn: "/portraits/coltar.mp4",
  // Elayne Trakand
  cmrrw1wjh00020nee52q5po4h: "/portraits/elayne.mp4",
  // Kezac
  cmrrw19ah00000neex1l0hcvt: "/portraits/kezac.mp4",
  // Lotus
  cmrrw1hu100010neebdxc4pyv: "/portraits/lotus.mp4",
};

// Même chose pour le visuel du meneur de jeu, sur /mj. Table distincte parce
// que la clé l'est : le hero de /mj est piloté par la campagne, pas par un
// personnage. Une seule campagne existe aujourd'hui (« main »), mais la clé
// évite de coder en dur une hypothèse qui n'est pas dans le schéma.
export const ANIMATED_MJ_PORTRAITS: Record<string, string> = {
  main: "/portraits/gamemaster.mp4",
};
