# Session 2026-07-20 — Suppression auth MJ, retour accueil, vidéo de fond de la landing

Tout poussé sur `origin/main` (dernier commit `469b085`). `main` en sync.

## Réalisé

### Suppression de la feature auth MJ (`ae31f9e`)
- L'auth MJ était **désactivée** depuis `3e3e581` (bloc commenté `TODO(à remettre)`). Décision : **la supprimer** plutôt que la réactiver.
- Retirés : page `/mj/login`, action `loginMj` + helper `login()` générique, type `Scope`, `MJ_PASSWORD` (`.env.example` **et** `.env` local), bloc commenté du middleware, `/mj/login` de `PUBLIC`.
- `lib/auth.ts` simplifié : `cookieName(scope)` → constante `COOKIE_NAME` ; `checkPassword`/`signSession`/`verifySession` ne prennent plus de scope.
- **Le JWT conserve le claim `scope:"app"`** (avec commentaire) pour ne pas invalider les cookies `app_auth` déjà émis. Vérifié : un cookie signé à l'ancienne donne toujours accès.
- `/mj` reste protégé — par l'auth d'app seule, ce qui était déjà le comportement effectif.

### Retour à l'accueil depuis `/table` (`0fe87da`)
- Le **wordmark « Cairn » devient un lien vers `/`** (convention : le logo ramène à l'accueil). Aucune ligne ajoutée au header, ne concurrence pas le CTA « Ajouter un personnage ». `group-hover:text-primary` comme indice de clicabilité, `aria-label` puisque le texte visible n'est que « Cairn ».
- Session conservée : sur la landing, « Commencer » est alors un lien direct vers `/table`, l'aller-retour est immédiat.
- **Corrigé au passage** : `/table` disait encore « Compagnon de campagne », oubli du renommage de `9ca2362`. Aligné sur « Carnet de campagne ».

### Boucle vidéo en fond de la landing (`a33e1d1`, corrigée par `469b085`)
- **Les vidéos sources ne bouclaient pas.** Deux causes cumulées, diagnostiquées à la mesure : un **fondu d'ouverture de 4 images** (l'image 0 est le point le plus sombre du clip) et une **discontinuité de contenu** (la flamme n'est pas au même endroit au début et à la fin). Recherche exhaustive des 441 couples début/fin : le meilleur restait à 4,3× le mouvement normal → **aucune coupe ne pouvait suffire**.
- **Traitement retenu** : coupe de l'amorce (4 images) + **fondu enchaîné de 12 images (0,5 s)** entre la fin et le début, puis ré-encode sans audio.
  - écart au raccord : desk 1,723 → **0,091** ; mobile 2,379 → **0,158** (mouvement normal ≈ 0,146 / 0,205, donc raccord **moins marqué qu'une transition ordinaire**).
- **Intégration** : le `<picture>` existant **reste la couche de base** (premier rendu inchangé) ; `LandingVideo.tsx` (client) superpose la vidéo en fondu à `canplay`. L'attribut `media` de `<source>` **n'est pas honoré dans `<video>`** → source choisie via `matchMedia`, une seule vidéo téléchargée par viewport. Sous `prefers-reduced-motion`, **rien n'est chargé** ; idem si l'autoplay est refusé : l'image reste.
- **Bug middleware corrigé** : le `matcher` n'excluait pas les vidéos → `/landing-*.mp4` partait en **307 vers `/?login=1`**, donc aucun fond pour un visiteur non connecté sur une landing pourtant publique. `mp4|webm` ajoutés à l'exclusion. **Même piège que `/icon` et `/apple-icon` le 19/07.**

### Correction du flou de la vidéo (`469b085`)
- Signalé par Adrien après coup. **Cause** : la vidéo est affichée **agrandie 2,6×** (1284 px natifs sur 2880 px physiques en Retina).
- Mesure d'énergie de contours **à l'échelle d'affichage réelle** :
  | version | poids desktop | netteté |
  |---|---|---|
  | CRF 28 (livré d'abord) | 173 Ko | 4,12 |
  | CRF 20 seul | 891 Ko | 4,23 |
  | **unsharp + CRF 28 (retenu)** | **296 Ko** | **9,63** |
  | image WebP (plafond) | 109 Ko | 14,21 |
- **La compression n'était qu'un facteur mineur** : baisser le CRF ne comblait que **1 %** de l'écart pour 5× le poids. Le levier est le **masque de netteté** (`unsharp=5:5:2.0`), qui rend le CRF indifférent (296 Ko et 1368 Ko donnent la même netteté). Absence de halos vérifiée sur lanterne et bougie.
- **Limite assumée** : la source vidéo est intrinsèquement moins détaillée que l'image fixe (3,95 même non compressée, contre 14,21). L'accentuation récupère un peu plus de la moitié de l'écart ; égaler l'image demanderait de **régénérer la vidéo à la source**.

### Vérifications de prod + durcissement des secrets (2e temps de la journée)
Aucun changement de code : uniquement de la config et de la vérification sur `https://jdr-book.vercel.app`.

- **`NEXT_PUBLIC_SITE_URL` posée** (local `http://localhost:3000`, prod sur Vercel) et redéployée. `og:url` et `og:image` sortent absolus, sans slash final. **Nuance : non prouvé.** La valeur attendue est identique à ce qu'aurait donné le repli `VERCEL_PROJECT_PRODUCTION_URL` — les deux branches du `??` convergent. Ne deviendra discriminant qu'au branchement d'un domaine custom.
- **Vidéos servies sans cookie : confirmé.** `landing-desk.mp4` (302 606 b) et `landing-mobile.mp4` (376 035 b) en `200 video/mp4`, tailles identiques à l'octet près aux fichiers locaux. Idem `landing*.webp`, `default-character.webp`, `opengraph-image`, `icon`, `apple-icon`. **Contrôle indispensable au test** : `/table` et `/mj` renvoient bien `307 → /?login=1` sans cookie — donc ce sont les exclusions du `matcher` qui laissent passer, pas une auth cassée. Aucun troisième oubli du type icônes/vidéos sur les assets présents.
- **Bucket `portraits` : déjà présent, la note précédente était périmée.** Sondé sans identifiants via `/storage/v1/object/public/portraits/<fichier-bidon>` → `"Object not found"`, contre `"Bucket not found"` sur un bucket inexistant (contrôle joué). Le caractère **public** est très probable mais pas formellement établi — preuve définitive au premier portrait affiché.
- **`MJ_PASSWORD` retiré des variables Vercel** par Adrien.
- **`AUTH_SECRET` durci** : placeholder remplacé par 64 caractères aléatoires (`token_urlsafe(48)`). Valeur dans `.env` local uniquement — **jamais dans un fichier suivi**. Reste à reporter sur Vercel.
- **`APP_PASSWORD` laissé à `slip`, sur arbitrage explicite d'Adrien** (voir Décisions).

### Vérifs
`tsc` + `next build` verts, **12/12 vitest** à chaque étape (y compris après rotation d'`AUTH_SECRET` : les tests utilisent leurs propres stubs d'env). Navigateur sur le **build de prod** : desktop 1440 (+ Retina DPR 2) et mobile 390, une seule vidéo par viewport, mouvement réduit = **0 octet chargé**, parcours de connexion intact, 0 erreur console.

## Reste à faire
- **Reporter `AUTH_SECRET` sur Vercel** (scope Production) puis redéployer. Variable lue à l'exécution, pas inlinée. **Effet de bord : invalide tous les cookies `app_auth` émis**, chacun se reconnecte une fois.
- **Sécurité de `loginAppAction`**, non traitée, à arbitrer si l'app s'ouvre au-delà de la table :
  - **aucune limitation de tentatives** — c'est le vrai sujet, il n'y a rien entre un attaquant et un essai illimité ;
  - `checkPassword` compare avec `===`, donc en **temps non constant** (théorique ici, bruit réseau largement supérieur au signal).
- Optionnel : manifest PWA + icônes 192/512.
- Optionnel : `autoComplete="current-password"` sur le champ de la modale (Chrome émet un avis verbose).
- Optionnel : **régénérer les vidéos à plus haute définition** à la source, seul moyen d'égaler la netteté de l'image fixe.
- ~~**`docs/coltar.mp4`** (13 Mo) toujours non suivi — si portraits animés sur les fiches, chantier à part~~ — **fait** au 3e temps de la journée, pour les 4 personnages et le MJ. Reste ouvert en revanche : les vignettes animées dans la grille `/mj` (plusieurs vidéos simultanées).
- Toujours devant : Lot 3 (session live / dés), Lot 4 (prépa MJ), Lot 5 (compendium SRD).

## Blockers
- Aucun.

## Décisions
- **`APP_PASSWORD` reste `slip`**, choix explicite d'Adrien après mesure. Le mot de passe se dicte à voix haute autour d'une table : la mémorisation a une valeur réelle, l'enjeu est un carnet de campagne entre joueurs. **Ne pas le « corriger » spontanément.** Risque résiduel connu et accepté : mot du dictionnaire, cassé au premier essai d'une attaque par dictionnaire — ce n'était pas « 15 h de brute force ».
- **`AUTH_SECRET` est l'arbitrage inverse** : aucun humain ne le tape, donc aucune raison de l'affaiblir. C'est lui qui ferme la **forge de cookie** (entrer sans passer par le formulaire) ; le mot de passe ne garde que la porte d'entrée. Deux protections distinctes, d'où deux niveaux d'exigence différents.
- **Entropie d'une phrase de passe, mesurée** (10 essais/s, sans throttling) : 19 bits → 15 h ; **36 bits (5 mots français) → 54 ans** ; 63 bits (4 mots du dictionnaire système) → inviolable mais indictable. **Au-delà de 5 mots le compromis n'existe plus** : on paie de la lisibilité contre une menace déjà nulle. Si un vrai mot de passe devient nécessaire, viser 5 mots.
- **Auth MJ supprimée, pas réactivée.** Le claim `scope:"app"` du JWT est conservé pour la compatibilité des cookies existants — à ne pas retirer sans accepter de déconnecter tout le monde.
- **Le wordmark est le lien d'accueil** sur `/table`. « Accueil » dans les boutons retour désigne toujours `/table` (fiche perso, `/mj`) ; la landing `/` est l'« écran-titre ».
- **Sources d'art ignorées dans git** : `/docs/landing*.png` **et** `/docs/landing*.mp4`. Seules les versions optimisées de `public/` sont versionnées. — *Élargi au 3e temps de la journée : la règle vidéo est devenue `/docs/*.mp4`, aucune source vidéo n'a vocation à être suivie.*
- **Chaîne vidéo de la landing**, à réappliquer telle quelle si régénération : coupe de l'amorce → fondu enchaîné 12 images → `unsharp=5:5:2.0` → H.264 CRF 28 sans audio, `+faststart`.
- **Règle middleware** : tout nouveau type d'asset statique servi depuis `public/` doit être ajouté au `matcher`, sinon il est intercepté par l'auth. Déjà oublié deux fois (icônes le 19/07, vidéos aujourd'hui).
- **Le `<picture>` reste la couche de base de la landing** ; la vidéo est une amélioration progressive posée par-dessus. Toute dégradation retombe sur l'image sans code dédié.

## Leçons de méthode (pour les prochaines fois)
- **Valider une image ou une vidéo à son échelle d'affichage réelle, jamais sur une vignette.** J'ai validé une vidéo de 1284 px sur un aperçu de 480 px et déclaré la qualité bonne : le test ne pouvait structurellement rien détecter. Le défaut est apparu chez Adrien.
- **Une mesure sans référence ne vaut rien.** J'ai d'abord déclaré la boucle « quasi parfaite » sur un écart absolu de 2,3/255, sans le comparer au mouvement image-à-image. Rapporté à cette référence, l'écart valait 11,8× — la boucle sautait franchement. L'intuition d'Adrien était juste contre ma mesure.
- **Attention aux artefacts d'image-clé quand on mesure un raccord de boucle sur un fichier encodé** : les premières images après une I-frame portent un bruit de quantification (~0,5 ici) qui masque complètement le signal. Mesurer sur la séquence d'images **avant** encodage.
- **Ne pas faire arbitrer un compromis avant de l'avoir mesuré.** J'ai fait choisir un niveau de CRF en présentant un arbitrage netteté/poids qui n'existait pas : le CRF ne changeait quasi rien à la netteté. Mesurer d'abord, proposer ensuite.
- **Toujours jouer le contrôle négatif.** Les deux vérifs de l'après-midi ne valaient que par leur témoin : les assets en `200` ne prouvaient rien tant que `/table` ne renvoyait pas `307`, et `"Object not found"` ne prouvait rien tant qu'un bucket bidon ne renvoyait pas `"Bucket not found"`. Sans le témoin, une auth entièrement cassée aurait produit le même résultat « tout vert ».
- **Une note de session est datée, pas vraie.** « Recréer le bucket » traînait depuis la veille alors que le bucket existait. Sonder avant de faire agir Adrien.
- **Une convergence n'est pas une preuve.** `og:url` correct ne montre pas que `NEXT_PUBLIC_SITE_URL` est lue : le repli donnait la même valeur. Distinguer ce qu'on observe de ce qu'on en déduit.

---

# 3e temps de la journée — Portraits animés (fiches + MJ)

Poussé sur `origin/main` (`d2c4a34..ad0b3ed`, 4 commits) et déployé. Prod vérifiée.

## Réalisé

### Portraits animés sur les fiches (`d3a6360`, `2712dcd`)
- **Blocker levé** : `docs/coltar.mp4` n'est plus en attente, le chantier « portraits animés » est fait pour les 4 personnages.
- La vidéo se joue **une fois** à l'ouverture de la fiche, puis se fond vers le portrait fixe, qui reste l'état de repos. Même contrat que `LandingVideo` : **l'image est la couche de base**, la vidéo une amélioration posée par-dessus, toute dégradation retombe sur l'image sans code dédié.
- **Deux fondus, de durées mesurées** :
  - **ouverture, 300 ms.** Ces vidéos sont régénérées à partir du portrait fixe et en **dérivent toujours** (30 à 33 dB) : visage légèrement différent, éléments animés déplacés. Que ça se voie dépend du mouvement du clip. Chez Coltar l'écart (31,8 dB) était **plus faible** que le mouvement d'une image (28,1 dB) → invisible. Chez Lotus le clip était quasi immobile au départ (**48,1 dB** entre deux images) → le changement de visage aurait sauté aux yeux.
  - **fin, 800 ms.** Les clips terminent loin de leur portrait (10 à 14 dB), souvent sur un gros plan où le personnage n'est plus reconnaissable. Sans fondu, la fiche resterait figée dessus.
- **Association perso → vidéo en code** (`src/lib/animated-portraits.ts`), pas en base : versionnée avec la vidéo qu'elle désigne, sans migration ni champ de formulaire. Deviendra une colonne le jour où un non-dev devra en poser une.

### Son sur demande stricte (`d3a6360`)
- Piste audio **copiée sans réencodage** (AAC stéréo), +167 Ko par vidéo.
- **L'ouverture est toujours muette**, quel que soit le navigateur. Une commande unique prend deux rôles : au repos elle relance avec le son, en lecture elle coupe/rétablit.
- Arbitrage : l'autoplay sonore n'est autorisé qu'après un geste dans le document. Il **passerait** depuis `/table` (navigation `<Link>`, même document, le clic sur la carte compte) mais serait **refusé** sur lien direct, rafraîchissement ou retour d'historique. Le muet inconditionnel est le seul comportement prévisible — et évite qu'une fiche consultée autour d'une table fasse du bruit toute seule.

### Visuel animé du MJ (`4e42ad3`)
- `/mj` suit le même motif de hero, le composant s'y pose tel quel. Table de correspondance **distincte** car la clé l'est : `/mj` est piloté par la campagne (`main`), pas par un personnage.
- **Défaut corrigé, présent depuis `d3a6360`** : les dégradés du hero sont posés **après** le bouton dans le DOM et interceptaient le pointeur. Le bouton restait **visible mais inerte** dès que le hero était assez court pour que le dégradé du bas remonte jusqu'à lui — cas de `/mj` (24/28 rem contre 26/30 rem pour une fiche). Réglé par `z-10`.
- Les **vignettes de personnages de la grille `/mj` restent des images fixes** : plusieurs vidéos lues simultanément non traitées.

### Nouvelle prise pour Lotus (`ad0b3ed`)
- `docs/lotus2.mp4` encodée **par-dessus `public/portraits/lotus.mp4`** : le nom de fichier désigne le personnage, pas la prise.
- Sans risque de cache, **vérifié** : Vercel sert les fichiers de `public/` en `max-age=0, must-revalidate` avec etag, donc revalidation à chaque requête.
- Le nouveau clip bouge davantage au démarrage (référence 48,1 → 36,2 dB). Le fondu d'ouverture garde son utilité, mais Lotus n'est plus le cas qui l'avait rendu nécessaire.

### Chaîne d'encodage retenue
`H.264 CRF 28, preset slow, audio copié (-c:a copy), +faststart`, résolution native 716×1284 conservée.
- **Pas d'`unsharp`**, contrairement à la chaîne de la landing : cette vidéo n'est **jamais agrandie** dans le créneau de fiche (au pire 0,97× sur mobile DPR 3). Le flou corrigé là-bas ne peut pas se produire ici.
- **Un seul fichier**, pas de découpage desk/mobile : contre-intuitif après la landing, c'est le **mobile qui est exigeant** (1248 px physiques en DPR 3) et non le desktop (960 en DPR 2).
- Qualité à l'échelle d'affichage réelle, pire image sur 241 : coltar 38,1 / elayne 37,6 / kezac 39,1 / lotus 38,3 / gamemaster 38,7 dB. **Monter le CRF double le poids sans gain visible** (mesuré : CRF 23 = 2 386 Ko, CRF 28 = 1 171 Ko, indiscernables à l'échelle réelle dans la zone la plus exposée au banding).
- Poids : 13 Mo → 1,1 à 1,9 Mo par vidéo. **~7,8 Mo ajoutés à l'historique git, définitivement.**

### Vérifs
`tsc` + `next build` verts, **12/12 vitest** à chaque étape. Navigateur sur le **build de prod** : 5 surfaces × 2 formats, bonne vidéo par personnage (contrôlée **contre le nom affiché**, pas l'identifiant envoyé), muet à l'ouverture, fondu d'ouverture mesuré en vol (rampe 0 → 0,39 → 0,90 → 1 sur ~300 ms), fondu de fin à 0,8 s, **cliquabilité du bouton 10/10**, mouvement réduit = 0 octet, 0 erreur console.
**En prod** : les 5 vidéos en `200`, identiques à l'octet près, servies sans cookie. Contrôle joué : `/table`, `/mj` et une fiche renvoient `307 → /?login=1`. Pas de troisième oubli du `matcher`.

## Reste à faire
- Repris de plus haut, toujours ouvert : **`AUTH_SECRET` sur Vercel** + redéploiement ; **limitation de tentatives sur `loginAppAction`** ; manifest PWA ; `autoComplete` sur la modale.
- **Contrôle non fait, à faire par Adrien** : netteté sur téléphone réel et son au clic. Les mesures ne remplacent ni l'un ni l'autre — c'est sur téléphone que le flou de la landing était apparu.
- Si le casting grandit : **basculer les vidéos vers le bucket Supabase** comme les portraits, plutôt que d'alourdir l'historique git.
- Non traité, écarté par Adrien : **lecture en plein écran** au clic sur Play.
- Non traité : **vignettes animées dans la grille `/mj`** (plusieurs vidéos simultanées).

## Blockers
- Aucun.

## Décisions
- **Portraits animés posés par un dev, en code.** Pas d'upload vidéo, pas de colonne en base tant que seul un dev en ajoute.
- **Fondu d'ouverture uniforme plutôt qu'un réglage par vidéo.** Imperceptible quand les images sont proches, masquant quand elles divergent : supprime un cas particulier et une mesure à refaire à chaque ajout.
- **Le son ne part jamais seul.** Choix d'Adrien contre le repli automatique. Rien ne fait de bruit sans un clic.
- **Le nom de fichier désigne le personnage, pas la prise.** Une nouvelle version écrase la précédente au même chemin.
- **Règle `.gitignore` élargie** de `/docs/landing*.mp4` à `/docs/*.mp4` : aucune source vidéo n'a vocation à être suivie, seule sa sortie l'est.
- **Plein écran écarté.** Aurait agrandi la vidéo 1,4× à 2,0× selon l'appareil, contre 0,75×–0,97× aujourd'hui.

## Leçons de méthode (pour les prochaines fois)
- **Vérifier l'action réelle, pas son proxy.** Le bouton de son est resté **inerte sur `/mj` depuis le premier commit** parce que je contrôlais sa *position* (« ne chevauche pas le portrait ») et jamais sa *cliquabilité*. Découvert par accident, en essayant de cliquer. Un test qui mesure une coordonnée ne teste pas un usage.
- **Ne pas généraliser depuis un seul cas favorable.** « Pas de fondu à l'ouverture » a été tranché sur Coltar seul ; Lotus l'a démenti. L'écart était comparable partout — ce qui changeait, c'est si le mouvement du clip le masquait.
- **Un harnais de test peut rendre une vérification impossible sans le dire.** Le Chromium de Playwright tourne avec `--autoplay-policy=no-user-gesture-required` : mon test d'autoplay sonore renvoyait « autorisé » et ne pouvait structurellement rien détecter. Vérifié en lisant les arguments du process. Même famille que le piège de la vignette, hier.
- **Attention aux mesures prises entre deux appels lents.** Deux captures « en cours de lecture » montraient en fait l'état de repos : le clip de 10 s s'était terminé entre mes commandes. Rendre l'opération atomique (`evaluate` unique qui attend l'événement) au lieu d'enchaîner des appels.
- **Remettre en état une donnée touchée par un test.** J'ai incrémenté la fatigue de Coltar pour forcer un rendu React ; remise à 0 **et vérifiée en base**, pas seulement à l'écran.
- **Corriger un commentaire devenu faux au même titre que du code.** « Vérifié sur les quatre vidéos » après en avoir ajouté une cinquième est une dette, pas un détail.
