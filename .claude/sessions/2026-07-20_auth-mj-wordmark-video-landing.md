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

## 7e temps — Vidéo d'ouverture au clic sur « Commencer »

### Réalisé
- **Séquence d'entrée** : clic → (mot de passe si besoin) → le bouton et la signature s'effacent (450 ms) → la vidéo d'ouverture couvre l'écran → à la fin, fondu de 550 ms vers le parchemin, puis `/table`. Mesurée bout en bout au navigateur, pas supposée : bloc à 0 dès 1,1 s, vidéo jouée 0 → 5,04 s, voile à 1,00 à 6,8 s, `/table` à 7,5 s.
- **`LandingStart.tsx` → `LandingEnter.tsx`** (`git mv`, historique conservé). Le composant possède désormais le bloc du bas *entier* — bouton **et** signature — parce que la cérémonie les efface d'un seul geste ; les découper entre serveur et client obligerait à faire remonter la phase.
- **`loginAppAction` ne redirige plus** : elle renvoie `{ ok: true }`. La redirection serveur tuait la landing avant que la vidéo puisse jouer.
- **Vidéo réencodée** : 8,5 Mo → **916 Ko** (720 px de large, CRF 23, piste audio retirée). Comparée à un encodage natif 1076 px / 2 Mo **à l'échelle d'affichage réelle (390 px)** : indiscernables. SSIM 0,984.
- **Fondu d'arrivée sur `/table`** (`animate-in fade-in duration-500`) : le voile de sortie est du même parchemin que le fond de la page, donc il ne se lève pas sur un saut de couleur.

### Le bug qui a coûté le plus de temps
Le mot de passe passait, la modale se fermait, **et rien ne partait**. Diagnostic par instrumentation (compteur de montage + trace de phase) plutôt que par relecture : aucun remontage, la phase ne quittait jamais `idle`.

Cause : poser le cookie **déclenche un rafraîchissement de l'arbre RSC**. `authed` repasse à `true`, `LandingEnter` bascule sur la branche « lien direct », et **`LoginDialog` est démonté avant que son `useEffect` sur `state.ok` ne se déclenche**. Le signal de succès mourait avec le composant censé lancer la cérémonie.

Correctif : `useActionState` et l'état d'ouverture remontent dans `LandingEnter` (l'écoute du succès doit survivre à la modale), et `authed` est **figé au premier rendu** (`wasAuthed`) pour que la branche du bouton ne bascule pas sous l'utilisateur.

### Filets posés
- **Mouvement réduit** : pas de cérémonie, entrée directe (mesuré : `/table` en 927 ms).
- **Autoplay refusé, décodage en échec, flux qui cale** : on entre quand même. Le garde-fou anti-blocage est calé sur la durée réelle de la vidéo + 3 s, pas sur une constante en dur.
- **Préchargement à l'intention** (survol, focus, ouverture de la modale), pas au montage : 916 Ko de plus ne partent pas pour un visiteur qui ne fait que regarder. Sur le parcours mot de passe, la saisie sert de fenêtre de chargement.
- Le bouton connecté **reste un vrai lien** : clic milieu et « ouvrir dans un onglet » continuent de marcher, seul le clic simple joue la vidéo.

### Reste à faire (ajouts de ce temps)
- ~~**`landing-desk-start.mp4` à fournir**~~ **FAIT** (7e→8e temps). Desktop jouait la portrait recadrée : vérifié en 1440×900, **c'est très zoomé et visiblement mou** (720 px étirés au double), la lanterne et les bougies sortent du cadre. Passable en provisoire, pas tenable. Une seule ligne à changer une fois le fichier déposé (`START_VIDEO` → choix par viewport, comme `LandingVideo`).
- **Contrôle sur téléphone réel** : la cérémonie dure ~7 s au total. À juger à l'usage — c'est agréable la première fois, la question est la dixième.
- Sur mobile il n'y a pas de survol : le préchargement ne dispose que des 450 ms d'effacement. À surveiller en 4G.

### Décisions
- **La vidéo joue aussi quand on est déjà connecté** (choix d'Adrien) : c'est un rituel d'entrée, pas une récompense de première connexion.
- **Audio retiré.** Lecture muette de toute façon, et un son surprise à l'entrée serait hostile.
- **Réencodage plutôt que l'original.** Arbitrage mesuré, pas supposé : à l'échelle d'affichage réelle, 916 Ko et 2 Mo sont indiscernables.

## 8e temps — Nouvelle image et boucle desk

### Réalisé
- Adrien a fourni `docs/landing-desk2.png` et `docs/landing-desk2.mp4` (scène redessinée : table en vue de dessus). Régénéré les assets `public/` desk.
- **Boucle vidéo** : la nouvelle source ne bouclait pas non plus (écart au raccord 2,37 = **9,2× le mouvement normal**, aucune coupe seule ne descendait sous 5,9×). Réappliqué la chaîne validée : coupe de 4 images d'amorce → fondu enchaîné de 12 images → `unsharp=5:5:2.0` → H.264 CRF 28 sans audio, `+faststart`. Écart au raccord ramené à **0,164 (0,65×)**, mesuré avant encodage. 361 Ko, 4,375 s.
- **Image de base** (`landing-desk.webp`) : **dérivée de la frame 0 de la boucle**, accentuée, q82 WebP (120 Ko). Choix d'Adrien.

### Correction qualité (même temps, après retour d'Adrien « mauvaise qualité »)
- **Cause mesurée à DPR 2** (et non sur vignette) : la source 1284 px étirée sur ~3000 px physiques Retina → flou. Le CRF n'était pas en cause (mon output 673 kbps > ancien validé 550). **Le levier est la résolution d'encodage**, pas le débit : à plus haute résolution le navigateur upscale beaucoup moins et l'accentuation porte plus.
- Comparé sur la page à DPR 2 : native 1284 (mou) < 1920 < **2560** (net). Puis remonté le CRF sans perte : CRF25 (1258 Ko) et **CRF29 (595 Ko) indiscernables** → la résolution suffit, le débit non.
- **Assets finaux** : vidéo `scale=2560:lanczos, unsharp=5:5:1.0, CRF 29, sans audio, +faststart` → **595 Ko** ; base `landing-desk.webp` régénérée au **même pipeline 2560** (q80, 155 Ko) pour que le repli soit net et reste aligné sur la vidéo. `unsharp` ramené de 2.0 à **1.0** (source plus molle → 2.0 sur-piquait/haloait).
- **Chaîne desk révisée** (remplace la native 1284 des temps précédents pour CETTE scène, plus détaillée) : boucle → `scale=2560:lanczos` → `unsharp=5:5:1.0` → H.264 CRF 29 sans audio +faststart.

### Remplacement par landing-desk3 (source haute résolution)
- Adrien a fourni `docs/landing-desk3.mp4` en **1924×1076** (vs 1284 pour desk2). Remplacé la scène desk.
- Même diagnostic de boucle (raccord 12× le mouvement normal) → même fondu enchaîné 12 images. Raccord ramené à **0,71×** (avant encodage).
- **Résolution native suffit** : la source étant vraiment en 1924, natif 1924 (391 Ko) et upscale 2560 (534 Ko) sont indiscernables à DPR 2. Retenu le **natif 1924** — plus léger, aucun pixel inventé. Plus de `scale` dans la chaîne pour desk3.
- Base `landing-desk.webp` régénérée depuis la frame 0, natif 1924, `unsharp=5:5:1.0`, q78 (143 Ko). Cadrage base↔frame0 vidéo vérifié (MAD 1,43) → fondu invisible.
- **Chaîne desk3 (source ≥ résolution d'affichage)** : boucle → `unsharp=5:5:1.0` → H.264 CRF 29 sans audio +faststart, **résolution native**. L'upscale n'est utile que si la source est sous la résolution d'affichage Retina (cas desk2 en 1284).

### Vidéo d'ouverture desktop (landing-desk-start) — le provisoire est levé
- Adrien a fourni `docs/landing-desk-start.mp4` (1924×1076, paysage). Desktop jouait jusque-là la **portrait recadrée** en attendant (provisoire assumé aux temps précédents). Fini.
- **Encodage** : pas de boucle (la vidéo joue une fois), natif 1924, sans audio, `+faststart`. CRF choisi par mesure : source / CRF22 / CRF25 / CRF28 indiscernables sur le détail statique ; **et surtout le pic d'explosion (frame 87, la plus lumineuse) ne bande pas à CRF28** — c'est le halo doré qui aurait trahi un CRF trop haut. Retenu **CRF28, 765 Ko**.
- **Code** (`LandingEnter.tsx`) : `START_VIDEO` constant remplacé par `startVideoSrc()` qui choisit selon le viewport (`min-width: 640px`), exactement comme `LandingVideo` pour la boucle de fond — l'attribut `media` de `<source>` n'étant pas honoré dans `<video>`. Desktop → `landing-desk-start`, mobile → `landing-mobile-start`.
- **Vérifié au navigateur** DPR 2 : desktop charge bien la paysage (1924), plein cadre sans recadrage, joue 0→5,04 s puis `/table` ; mobile 390 charge toujours la portrait (720). Non-régression confirmée des deux côtés.

### Position du titre calée sur le fond desk
- Sur la scène desk (vue de dessus), le titre à `19vh` frôlait le livre fermé et les bougies du haut. Descendu à **27vh sur desktop** (`sm:pt-[27vh]`) : « Cairn » se centre dans le panneau de bois vide au centre de la table, entre les objets du haut et le grimoire ouvert ; le sous-titre garde de l'air au-dessus des dés. Valeur choisie par comparaison visuelle (19/24/27/30vh) à DPR 2.
- **Mobile intact à 19vh** : autre composition (portrait), autre calage. Override par le seul breakpoint `sm:` (640px), le même que la bascule vidéo/image. Non-régression mobile vérifiée.

### Le piège évité
L'image `landing-desk2.png` (plan large, tabourets visibles) et la vidéo `landing-desk2.mp4` (plus resserrée) sont **deux compositions différentes** — vérifié : la recherche d'alignement par recadrage centré trouve son optimum à zoom 1,0, donc la vidéo n'est pas un agrandissement de l'image. Or l'ancienne paire était alignée au pixel (la vidéo = version animée de l'image). Livrer la nouvelle paire telle quelle aurait rejoué, sur desktop, **le saut de zoom au fondu image→vidéo** qu'Adrien venait de faire supprimer sur mobile. D'où la question posée, et la base dérivée de la vidéo : fondu invisible par construction (vérifié au navigateur en 1440, cadrages identiques).

### Fausse alerte instructive
Le fichier servi mesurait un raccord à **5,7× le mouvement normal** — apparence de régression. En réalité **artefact de mesure de la frame I** : le pic tombe toujours sur la transition 0→1, frame 0 étant un keyframe reconstruit à part. Référence décisive : les **anciennes boucles validées sur téléphone** mesurent, même méthode, 1,08 (desk, 8,0×) et 1,77 (mobile, 6,4×). La nouvelle (1,18, 5,7×) est dans la plage, meilleure en ratio. La vraie continuité de contenu (0,65×, avant encodage) est le bon chiffre. — *Leçon : mesurer le raccord d'une boucle **avant** l'encodage h264, ou comparer à une boucle de référence encodée pareil ; le wrap post-h264 est gonflé par le keyframe.*

### Reste à faire (ajouts de ce temps)
- Sources `docs/landing-desk.png` / `landing-desk.mp4` (anciennes) devenues obsolètes ; `docs/*` art est de toute façon gitignoré. À supprimer au prochain ménage si confirmé.
- Contrôle à faire par Adrien sur écran réel : netteté du repli desk (mouvement réduit / autoplay refusé) maintenant qu'il vient d'une frame vidéo et non d'un PNG dédié — arbitrage accepté, mais à confirmer en usage.

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
- ~~**Contrôle non fait, à faire par Adrien** : netteté sur téléphone réel et son au clic~~ — **fait, validé par Adrien sur téléphone.** La chaîne d'encodage est donc confirmée sur le terrain : **CRF 28, sans `unsharp`, résolution native 716×1284, un seul fichier**. Ne pas la durcir spontanément — c'est mesuré *et* vérifié en usage réel, contrairement à la landing où le flou n'était apparu qu'à ce stade.
- Si le casting grandit : **basculer les vidéos vers le bucket Supabase** comme les portraits, plutôt que d'alourdir l'historique git.
- ~~Non traité, écarté par Adrien : **lecture en plein écran** au clic sur Play.~~ — **repris et fait au 4e temps**, sous forme de modale embarquée. L'argument d'agrandissement qui l'avait écarté n'a pas disparu, il a été accepté.
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

---

# 4e temps de la journée — Hauteur du hero MJ, lecture en grand

Poussé sur `origin/main` (`4b6a0bd..5d1922e`, 2 commits).

## Réalisé

### Hero de `/mj` à la hauteur des fiches (`2fffb42`)
- `/mj` était en `24/28 rem` là où une fiche personnage est en `26/30 rem`. Aligné. Tout le contenu du hero étant positionné en absolu, rien d'autre à toucher.
- À noter : c'est cette hauteur plus courte qui avait rendu le bouton inerte hier (le dégradé du bas remontait jusqu'à lui). Le `z-10` reste nécessaire — il ne dépendait pas de la hauteur, seulement de l'ordre dans le DOM.

### Lecture en grand dans une modale embarquée (`5d1922e`)
- **Revirement assumé** : le plein écran avait été écarté hier sur l'argument de l'agrandissement (1,4×–2,0×). Adrien l'a redemandé, puis a préféré une **modale embarquée** au plein écran natif.
- **Modale plutôt que plein écran natif** : l'habillage reste celui de l'app et le comportement est identique partout, là où iOS remplace la page par un lecteur système. Le plein écran natif avait d'abord été implémenté et vérifié (il marchait, `requestFullscreen` + `webkitEnterFullscreen`) avant d'être remplacé.
- **La modale a sa propre balise vidéo.** React ne peut pas transporter un nœud d'un parent à l'autre sans le remonter, ce qui couperait la lecture. Le fichier étant déjà en cache après l'ouverture de la fiche, ce second élément ne coûte pas un téléchargement.
- Ouvrir la modale **remet le hero au repos** (deux lectures décalées du même clip, l'une muette, n'ont aucun intérêt). La fin du clip referme la modale.
- **Bâtie sur le `Dialog` Radix déjà présent** (`components/ui/dialog.tsx`) : Échap, focus trap, scroll lock, portail — rien de réécrit.

### Deux défauts trouvés en mesurant, corrigés
- **La vidéo débordait de la fenêtre** : dans la grille par défaut de `DialogContent`, le `max-h-full` de la vidéo se résout contre une piste dimensionnée par son contenu et ne contraint rien. Mesuré : 1284 px de haut pour 862 disponibles. Passé en `flex` → 481×862.
- **Le `×` de fermeture était invisible** : celui de `DialogContent` est gris à 70 % d'opacité, pensé pour un fond de carte clair, pas pour une vidéo sombre. Remplacé par un bouton contrasté du même style que celui du hero (`showClose={false}`).

### Vérifs
`tsc` + `next build` verts, **12/12 vitest**, 0 erreur console. Navigateur sur le **build de prod**, desktop 1512×862 et mobile 390×844, sur `/mj` et sur une fiche : bonne vidéo par page (contrôlée contre le nom affiché), cadrage tenu dans les deux formats, fermeture par **Échap / bouton / fin du clip** — les trois rendent le scroll et repassent au portrait fixe —, `main` masqué aux lecteurs d'écran pendant l'ouverture, **une seule `<video>` restante** dans le DOM après fermeture.

## Reste à faire
- Repris des temps précédents, toujours ouvert : **`AUTH_SECRET` sur Vercel** + redéploiement ; **limitation de tentatives sur `loginAppAction`** ; manifest PWA ; `autoComplete` sur la modale de login.
- **Contrôle non fait, à faire par Adrien : netteté de la vidéo dans la modale sur téléphone réel.** Elle y est agrandie **~1,6×** (390 px CSS = 1170 px physiques en DPR 3, pour une source de 716), contre 0,97× au pire dans le hero. C'est exactement le facteur qui avait fait écarter le plein écran. **Si ça pique, la réponse est de réencoder en résolution supérieure, pas de retoucher le CSS** — l'encodage actuel n'a aucune marge à cette échelle.
- Si le casting grandit : **basculer les vidéos vers le bucket Supabase** plutôt que d'alourdir l'historique git.
- Non traité : **vignettes animées dans la grille `/mj`** (plusieurs vidéos simultanées).

## Blockers
- Aucun.

## Décisions
- **Modale embarquée plutôt que plein écran natif.** Choix d'Adrien. Rendu cohérent avec l'app et identique sur tous les navigateurs ; on renonce à la rotation automatique et aux gestes système.
- **Deux balises vidéo plutôt qu'un déplacement de nœud.** Contrainte de React, pas une préférence.
- **La fin du clip referme la modale.** Cohérent avec le hero, où la fin ramène au portrait fixe.
- **L'agrandissement sur mobile est accepté par défaut, pas mesuré comme acceptable.** À trancher après contrôle sur téléphone.

## Leçons de méthode (pour les prochaines fois)
- **Une capture d'écran peut arriver après que l'état a disparu.** Ma première capture de la modale montrait la page sans modale : le clip de 10 s s'était terminé entre le clic et la capture, et la fermeture automatique avait fait son travail. **Même piège qu'hier** avec les deux captures « en cours de lecture ». Réflexe à prendre : figer l'état (`pause()`) avant de capturer, ou rendre l'opération atomique.
- **Un défaut de mise en page ne se voit pas dans le DOM, il se mesure.** La vidéo débordait de 422 px en hauteur ; tous les attributs étaient corrects et la balise était bien là. C'est `getBoundingClientRect` comparé à la fenêtre qui l'a montré, pas l'inspection de la structure.
- **Un composant partagé porte les hypothèses de son premier usage.** Le `×` de `DialogContent` était réglé pour la modale de login, sur fond de carte clair. Réutiliser le composant sur fond sombre ne suffisait pas ; il fallait vérifier le contraste dans le nouveau contexte.
- **Un arbitrage tranché hier peut être rouvert demain, et c'est normal.** Le plein écran avait été écarté avec de bons arguments, mesurés. Ils n'ont pas cessé d'être vrais : Adrien a choisi d'en payer le prix. Noter le revirement **et** ce qui reste vrai de l'argument d'origine, plutôt que d'effacer l'un ou l'autre.

---

# 5e temps de la journée — Garde-fou, commandes séparées, landing, témoin de chargement

Poussé sur `origin/main` (`b763863..9afd47b`, 4 commits).

## Réalisé

### Une seule ouverture animée par portrait et par onglet (`79fdc3f`)
- Revenir sur une fiche déjà vue ne relance plus la vidéo. **Portée par clip** (chaque portrait a droit à son ouverture), drapeau en `sessionStorage` sous `portrait-anime-vu:<chemin>`.
- **Le drapeau est posé sur `playing`**, pas au montage : un autoplay refusé (Safari/iOS, économie d'énergie) aurait sinon brûlé l'unique ouverture sans que rien n'ait été montré.
- **Ouvrir la modale marque aussi le portrait comme vu**, sinon revenir sur la fiche juste après relancerait l'ouverture — la redondance même qu'on veut supprimer.
- Accès au stockage protégé (`try`/`catch`) : il lève en navigation privée sur certains Safari. En cas d'échec le garde-fou ne s'applique pas et l'animation se rejoue — jamais une page cassée.
- **Contrôle joué** : après vidage du `sessionStorage`, l'animation repart. C'est bien le garde-fou qui la supprimait, pas autre chose de cassé. 2e visite : **aucune source posée, 0 octet**.

### Rejouer sur place et voir en grand, séparés (`4634c4d`)
- Play rejouait dans la modale, ce qui ôtait toute façon de revoir le clip **à sa place** dans le hero. Il redevient un rejeu sur place avec le son ; l'agrandissement passe sur un **bouton dédié**, offert au repos comme en cours de lecture.
- Commandes **empilées** et non côte à côte : la bande floutée est étroite, deux boutons alignés déborderaient sur le visage en mobile. Mesuré en 390 px — cibles 44×44, boutons à x=327, portrait jusqu'à 305.
- Habillage des pastilles sorti dans une constante, partagé par les deux commandes du hero et la fermeture de la modale.

### Landing éclaircie (`90bc48e`)
- **Mesure avant action, et elle a changé la solution** : la vidéo n'est *pas* plus sombre que l'image de base (71,5 contre 72,5 de luminance moyenne, 1 % d'écart). Ce sont les **voiles noirs** qui assombrissent — source à 71,5, composite à 38,5.
- Agir sur les voiles éclaircit **les deux couches à l'identique** : pas de réencodage, pas d'octet ajouté, et **aucun saut de luminosité au fondu image → vidéo**. Éclaircir la vidéo seule aurait rendu la bascule visible.
- Dégradé `55/35/80 → 38/18/66`, vignette `0,6 → 0,45`. **+33 % de luminance composite.** Contraste texte/fond mesuré sur le rendu : **5,8:1 au pire** (bande du titre), contre 4,5:1 exigé pour du texte normal, 3:1 pour du grand texte — et le titre porte une ombre portée.
- Variante à +50 % essayée et **écartée** : elle aplatit la vignette et fait perdre l'ambiance à la bougie.

### Témoin de chargement dans la carte cliquée (`9afd47b`)
- Les fiches sont des **routes dynamiques sans `loading.js`** : entre le clic et l'affichage, rien ne bougeait.
- `useLinkStatus` (Next 16, contrat vérifié dans la doc via context7) ne renseigne que sur le `<Link>` englobant → **état par carte**. Vérifié en cliquant la 3e carte sur 5 : elle seule s'allume.
- **Le délai à l'apparition n'est pas cosmétique** : sans lui, une navigation courte ferait clignoter le témoin à chaque clic, plus perturbant que pas d'indicateur. Mesuré : opacité à 0 pendant ~120 ms, puis montée. Pas de délai au retour.
- Posé **en haut à gauche** dans toutes les cartes : seul coin libre, l'écusson du meneur occupant la droite.

### Vérifs
`tsc` + `next build` verts, **12/12 vitest** à chaque étape. Navigateur sur le **build de prod**, desktop 1440×900 et mobile 390×844. Pour le témoin, **latence réseau émulée par CDP** — sans ça la navigation locale est trop rapide pour qu'il apparaisse, et le test n'aurait rien testé.

## Reste à faire
- Repris des temps précédents, toujours ouvert : **`AUTH_SECRET` sur Vercel** + redéploiement ; **limitation de tentatives sur `loginAppAction`** ; manifest PWA ; `autoComplete` sur la modale de login.
- **Contrôle non fait, à faire par Adrien** : netteté de la vidéo **dans la modale** sur téléphone réel (~1,6× d'agrandissement, contre 0,97× au pire dans le hero). Si ça pique, **réencoder en résolution supérieure, pas retoucher le CSS**.
- **Contrôle non fait** : la landing éclaircie sur téléphone réel. Les écrans de téléphone sont souvent plus lumineux — le réglage peut y paraître délavé là où il est juste sur desktop.
- Si le casting grandit : **basculer les vidéos vers le bucket Supabase**.
- Non traité : **vignettes animées dans la grille `/mj`** (plusieurs vidéos simultanées).
- Toujours devant : Lot 3 (session live / dés), Lot 4 (prépa MJ), Lot 5 (compendium SRD).

## Blockers
- Aucun.

## Décisions
- **Garde-fou par personnage et par onglet**, pas global ni définitif. L'animation présente le personnage : la refuser parce qu'un autre a été vu avant serait arbitraire, et un `localStorage` priverait à jamais un joueur à qui l'on prête le téléphone.
- **Deux commandes indépendantes.** Agrandir n'est pas une étape de la lecture mais un choix à part.
- **Éclaircir par les voiles, pas par la vidéo.** Une seule couche éclaircie aurait créé un saut au fondu.
- **Éclaircissement modéré (+33 %) plutôt que fort (+50 %).** « Un peu », comme demandé ; la variante forte perd la vignette.

## Leçons de méthode (pour les prochaines fois)
- **Mesurer avant d'agir peut changer la solution, pas seulement la valider.** La demande était « éclaircir la vidéo » ; la mesure a montré que la vidéo n'y était pour rien. Corriger la vidéo aurait créé un défaut (saut au fondu) tout en laissant la cause en place.
- **Un test qui ne peut pas échouer ne teste rien.** Le témoin de chargement n'apparaît jamais sur une navigation locale non bridée. Sans latence émulée, j'aurais « vérifié » un composant invisible et conclu à tort. Même famille que le Chromium de Playwright lancé avec `--autoplay-policy=no-user-gesture-required` hier.
- **Vérifier aussi le cas inverse.** Le témoin devait apparaître sur navigation lente *et* rester invisible sur navigation rapide. Le second cas est celui qui aurait produit un clignotement en usage réel, et il ne se voit pas si on ne teste que le premier.
- **Contrôler la portée d'un état partagé en le déclenchant hors du premier élément.** Cliquer la 1re carte n'aurait pas distingué « état par carte » de « état global » : c'est en cliquant la 3e qu'on le prouve.

---

# 6e temps de la journée — Signature Viloris, accessibilité de la landing, bouton en cire

Poussé sur `origin/main` (`17a14a9..9a3f9d1`, 2 commits).

> **Note d'historique** : `3b3c04b` a été commité par Adrien lui-même en cours de session (16h05), pas par l'assistant. Il est **libellé en anglais** alors que tout le reste de l'historique est en français — à reformuler si la cohérence compte (déjà poussé, demanderait un `push --force`).

## Réalisé

### Signature « Site réalisé par Viloris.io » (`3b3c04b`)
- Placée **sur la landing uniquement**, sous le bouton « Commencer ». Les autres pages (table, fiche, MJ) sont des outils de jeu : une signature y ferait tache.
- **L'opacité a demandé deux mesures et le calcul s'est trompé les deux fois.** `parch/40` (proposé d'emblée) donnait 3,2:1. Corrigé en `/55`, qui **calculait 5,0:1 mais ne mesurait que 3,66:1 à l'écran**. Retenu : `/70`, mesuré à **4,99:1**.
- Cause de l'écart : **à 11 px l'antialiasing dilue les glyphes**, qui n'atteignent jamais la couleur pleine. Le calcul théorique surestime d'environ 1,4 point à cette taille.
- Erreur d'échantillonnage au passage : la première mesure visait le fond sombre, alors que **le texte tombe en fait sur la page du grimoire**. Seule la capture d'écran l'a montré.

### Accessibilité de la landing (`3b3c04b`)
- **Anneau de focus invisible.** Le lien Viloris est focusable ; l'anneau global est rouille (`--ring`), calibré pour le fond parchemin. Sur la scène nocturne il mesure **2,27:1**, sous le minimum WCAG non-texte de 3:1. Pire pour le bouton : rouille sur bouton rouille. Classe `focus-ring-parch` sur la landing seulement → **13,4:1**.
- **Contrainte de couche, non devinable** : la règle doit vivre dans `@layer utilities`. Placée dans `base`, elle est silencieusement écrasée par le `* { outline-ring/50 }` que Tailwind émet en `utilities`. Noté en commentaire dans `globals.css`.
- **Aucun garde-fou `prefers-reduced-motion`** sur les entrées de la landing : `tw-animate-css` n'en embarque pas (vérifié dans le paquet). `LandingVideo` et `AnimatedPortrait` gèrent le cas en JS, mais les trois entrées échelonnées s'exécutaient en entier. Garde-fou **global** ajouté ; mesuré sous `reducedMotion: reduce` à 120 ms : opacité 1, aucune transform.
- Le `animation-delay` est neutralisé **en plus** de la durée : sinon `fill-mode-backwards` retient l'élément invisible pendant toute son attente.

### Bouton « Commencer » en cire pressée (`9a3f9d1`)
- **L'ombre ignorait la lumière de la scène.** Elle tombait droit (`0 20px 25px`) alors que la lanterne et la bougie éclairent depuis la gauche (**luminance mesurée dans l'image : 72,7 gauche / 83,8 centre / 43,6 droite**). C'est ce qui le faisait flotter au-dessus du décor. Biseau allumé en haut-à-gauche, ombre qui fuit vers la droite.
- **Le survol effaçait le bouton** : `hover:bg-primary/80` le pâlissait *vers le fond*, au moment précis où on le visait. Désormais la cire prend la lumière et se décolle ; le clic l'enfonce et rétracte l'ombre.
- **Deux hauteurs concurrentes** : `size="lg"` posait `h-9`, `START_CLASSES` posait `py-6` — la taille rendue ne tenait qu'à l'ordre des classes. `h-14` explicite, et 56 px passent la cible tactile de 44 px (les 50 px précédents ne passaient que de justesse).
- Pas de `border` : le relief vient uniquement d'ombres internes, pour ne pas retomber sur le filet-plus-halo du bouton générique.
- Libellé mesuré à **5,29:1** sur le dégradé — qui s'assombrit vers le bas-droit, c'était là le risque.

### Vérifs
`tsc` + `next build` verts, **12/12 vitest**. Navigateur en desktop 1440×900 et mobile 390×844. Les trois états du bouton (repos / survol / enfoncé) **lus sur le style calculé**, pas supposés : `translateY(2px)` gagne bien la cascade malgré le `active:` concurrent du composant shadcn.

## Reste à faire
- Repris des temps précédents, toujours ouvert : **`AUTH_SECRET` sur Vercel** + redéploiement ; **limitation de tentatives sur `loginAppAction`** ; manifest PWA ; `autoComplete` sur la modale de login.
- Toujours ouverts, contrôles sur téléphone réel : netteté de la vidéo **dans la modale** (si ça pique, réencoder en résolution supérieure, pas retoucher le CSS) ; **landing éclaircie** (les écrans de téléphone sont plus lumineux, le réglage peut y paraître délavé).
- **Deux arbitrages du bouton, non tranchés** : (1) intensité du reflet chaud — si le rendu est trop matiéré, la variable à baisser est le premier `inset` de `.btn-wax` (`0.3` au repos) ; (2) le bouton « Entrer » de la modale de connexion est resté standard, donc les deux boutons du parcours ne se ressemblent pas.
- **Commit `3b3c04b` libellé en anglais** — à reformuler ou à laisser, au choix.
- Si le casting grandit : **basculer les vidéos vers le bucket Supabase**.
- Non traité : **vignettes animées dans la grille `/mj`**.
- Toujours devant : Lot 3 (session live / dés), Lot 4 (prépa MJ), Lot 5 (compendium SRD).

## Blockers
- Aucun.

## Décisions
- **Signature sur la landing seulement.** Les pages-outils restent des outils.
- **Anneau de focus parchemin sur la landing, rouille ailleurs.** Un seul anneau ne peut pas servir un fond parchemin et une scène nocturne.
- **Garde-fou reduced-motion global**, pas limité à la landing — à restreindre si ça gêne ailleurs.
- **Bouton en matière plutôt qu'en correctifs seuls.** La landing est la surface d'identité ; un bouton shadcn par défaut y était le seul élément à dire « application web ».
- **Commit direct sur `main`**, en suivant la convention du dépôt (Adrien venait d'y committer), plutôt qu'une branche non demandée.

## Leçons de méthode (pour les prochaines fois)
- **Le contraste calculé n'est pas le contraste rendu, en dessous d'une certaine taille.** À 11 px, l'antialiasing coûte ~1,4 point. `parch/55` a *passé* la vérification sur le papier avant d'échouer à l'écran. En petit corps, mesurer les pixels rendus, jamais la formule seule.
- **Quand une correction ne prend pas, suspecter le test avant de re-corriger le code.** L'anneau de focus mesurait toujours rouille après un correctif pourtant valide : le lien porte `transition-colors`, qui transitionne `outline-color`, et la lecture se faisait à l'instant du Tab, soit au départ de la transition. Deux hypothèses concurrentes — CSS faux ou test faux — que seule **la lecture de la feuille réellement servie** a permis de départager.
- **Les couches CSS battent la spécificité.** Une règle `base` perd contre une utilitaire Tailwind quelle que soit sa spécificité. Symptôme trompeur : la règle est bien présente dans le CSS livré, et pourtant sans effet.
- **Vérifier l'état de git avant de committer, pas seulement le diff.** Un commit était apparu en cours de session sans que l'assistant l'ait fait ; s'y fier aveuglément aurait produit un message de commit décrivant du travail déjà parti.
