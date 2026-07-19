# Session 2026-07-19 — MVP Cairn : socle + fiches + thème visuel

## Réalisé
- Cadrage complet (brainstorming → spec → plan) :
  - `docs/superpowers/specs/2026-07-19-jdr-cairn-mvp-design.md`
  - `docs/superpowers/plans/2026-07-19-jdr-cairn-mvp.md`
- Implémentation du MVP (lots 1+2), 11 tâches, vérifié end-to-end au navigateur :
  - Accès : mot de passe app + 2e mot de passe MJ (cookies JWT signés `jose`, middleware `src/middleware.ts`).
  - Modèle Prisma `Character`/`Item`/`Note` aligné sur la fiche FR (FOR/DEX/VOL/PV, Passé, Épuisé·e, Armure, Sous, Petits Objets, Inventaire 1-10, Fatigue).
  - Accueil en cards + création de perso ; fiche éditable par tous (onBlur) ; inventaire + compteur de slots (alerte > 10) ; import portrait (Supabase Storage) ; dashboard MJ + notes secrètes.
  - Tests Vitest verts (auth, slots, actions persos, actions notes), `tsc --noEmit` OK.
- **Barre de Fatigue** 0→10 (cases cliquables + −/+) reliée au compteur de slots en direct ; Sous/Armure rendus lisibles.
- **Fix hydratation** : `suppressHydrationWarning` sur `<body>` + les 2 champs mot de passe (injection d'attributs par les extensions/gestionnaires de mots de passe).
- **Thème visuel « Parchemin fidèle »** appliqué à toute l'app (10 fichiers) :
  - Polices auto-hébergées via `next/font` : **Pirata One** (blackletter, titres) + **EB Garamond** (corps).
  - Palette parchemin en tokens Tailwind (`@theme`) + texture papier ; accent rouille `#8a3a2b`, mousse `#4c5a3c` (MJ).
  - Fiche présentée comme une feuille encadrée ; `lang="fr"`, onglet « Cairn ».
  - Maquette de comparaison des 4 directions publiée en Artifact (choix = direction 1).
- **Git** : tout mergé sur `main` et poussé. Dernier commit `74d013e`. Branches `feat/mvp-cairn` et `feat/theme-parchemin` supprimées (local + `origin`). `main` en sync avec `origin`.

## Reste à faire
- **Supprimer le perso de test « Aelric »** créé pendant les tests (encore dans la base Supabase) — via le bouton Supprimer de sa fiche.
- **Durcir les secrets** avant tout usage réel : `AUTH_SECRET` est encore le placeholder ; `APP_PASSWORD="slip"` / `MJ_PASSWORD="superslip"` sont faibles.
- **Lot 3 — Session live** (prochain gros chantier) : lanceur de dés qui résout les jets *roll-under* (d20 sur FOR/DEX/VOL, dégâts = dé d'arme − armure) + temps réel (Supabase Realtime).
- **Lot 4 — Prépa MJ** (PNJ, monstres, scénario). **Lot 5 — Compendium SRD Cairn.**
- 2 polish déjà faits (rappel, ne pas refaire) : « ← Accueil » au-dessus du titre MJ + padding du tableau MJ.

## Blockers
- Aucun. (`gh` non installé → toute PR se fait via le web ; ici on a mergé en direct sur `main`.)

## Décisions
- Système : **Cairn 2e** (rules-light). App **mono-campagne**, pas de comptes individuels.
- Accès **option B** : fiches ouvertes en lecture/édition à tous, interface MJ derrière un 2e mot de passe.
- **Prisma figé en v6** : Prisma 7 impose des driver-adapters + `prisma.config.ts` (trop de friction).
- Champs **non-contrôlés** (`defaultValue` + `onBlur`) pour éviter les conflits d'état avec `revalidatePath`.
- Middleware dans **`src/middleware.ts`** (obligatoire avec un dossier `src/`).
- Cookies `secure` conditionnés à la production (sinon refus en http local).
- Thème : **univers clair unique** (parchemin), **pas de dark mode** — c'est l'identité Cairn, choix assumé.
- Intégration : on **merge directement sur `main`** (branche courte → fast-forward → push → suppression), pas de PR tant que `gh` n'est pas là.

---

## Passe UI/UX — shadcn rethémé parchemin + responsive (même jour, `/loop`)

### Réalisé
- Spec : `docs/superpowers/specs/2026-07-19-ui-ux-shadcn-parchemin.md`.
- **shadcn/ui installé** (CLI « nova », base **radix**) et **rethémé sur la palette parchemin** : mapping des tokens sémantiques shadcn (`--background`, `--primary`, `--muted-foreground`…) → couleurs Cairn dans `globals.css`. **Univers clair unique conservé** (pas de dark mode, `sonner` forcé en `theme="light"`). Geist retiré, polices Cairn gardées.
- Collisions de tokens résolues : mes anciens `text-accent`/`text-muted` → migrés vers `text-primary`/`text-muted-foreground` (shadcn possède ces noms). Tokens sans collision gardés : `parch/panel/ink/line/moss`.
- **6 surfaces migrées** vers composants shadcn (Card, Input, Textarea, Label, Checkbox, Button, Badge, Separator) : login, login MJ, accueil, nouveau perso, fiche perso, dashboard MJ.
- **Responsive mobile-first** vérifié au navigateur (390px + 1280px) : attributs 2→4 col, en-tête fiche en colonne sur mobile, **dashboard MJ tableau (desktop) → cartes empilées (mobile)**, aucun overflow horizontal.
- **Modals de confirmation `AlertDialog`** sur toutes les actions destructives : suppression perso, objet d'inventaire, note MJ. Anti-friction : suppression directe si l'élément est encore vide.
- **Feedback de sauvegarde** : `useFieldSave` (autosave onBlur dédupliqué + toast `sonner` discret). Badge d'alerte de surcharge d'inventaire. `SubmitButton` avec état `pending`.
- Vérifs vertes : `tsc`, `vitest` (9/9), `next build`, navigateur desktop+mobile (0 erreur console). Code mort retiré (`ui/dialog.tsx` non utilisé).
- **Mergée sur `main`** (fast-forward `49766f3 → 0dba498`) et **poussée sur `origin/main`**. Branche `feat/ui-shadcn-parchemin` supprimée en local. (Rien à supprimer côté distant : la branche n'avait jamais été poussée, seul `main` l'a été.)

### Reste à faire (hérité / nouveau)
- ~~Supprimer le perso de test « Aelric le Brave »~~ — **fait** (absent de la base ; persos actuels : Coltar, Kezac, Lotus, Solveig).
- Reste inchangé : durcir les secrets, Lot 3 (session live/dés), Lot 4 (prépa MJ), Lot 5 (compendium).

### Décisions
- **Intégration shadcn = rethéme parchemin** (option recommandée), pas le look neutre par défaut.
- shadcn possède les noms `accent`/`muted` → on lui laisse ces utilitaires et on migre le code ; le rouille passe par `primary`, le brun secondaire par `muted-foreground`.
- Fatigue : on garde les **cases cliquables** (plus lisible qu'un Slider pour du 0–10 discret), juste rethémées.

---

## Passe portraits / avatars + rework accueil (même jour)

### Réalisé
- **Import d'avatar fiabilisé** (`e532d9c`) : le champ fichier natif faisait un doublon de boutons → composant dédié `PortraitUpload` avec **un seul bouton** (champ caché + auto-submit). **Redimensionnement client** avant envoi (768px max, WebP q.82) qui règle l'erreur « Body exceeded 1 MB limit » des Server Actions ; `serverActions.bodySizeLimit=4mb` en filet. `toast` d'erreur + reset du champ.
- **Bug infra trouvé en testant** : le bucket Supabase Storage **`portraits` n'existait pas** → l'upload d'avatar n'avait **jamais** marché. Créé (public) via la clé service-role. **⚠ à recréer sur chaque environnement (prod comprise).**
- **Accueil retravaillé** (`37e2471`) : cards personnage au **format 9:16**, nom en surimpression sur dégradé, état vide soigné. **Le MJ a son propre visuel** : singleton Prisma `Campaign` (id `"main"`, `mjImageUrl`) + migration, `uploadMjPortrait`, `PortraitUpload` généralisé (prop `action`). Visuel MJ sur la bannière accueil + en-tête `/mj`.
- **Fix bug de largeur** (`37e2471`) : `<body>` repassé de `flex flex-col` → `min-h-full`. Les marges auto de `<main>` (`mx-auto`) désactivaient le stretch flex → `main` s'effondrait à ~414px. Ne « marchait » avant que par accident (texte en flux `truncate/nowrap` des vieilles cards) ; les cards 9:16 (contenu `absolute`) ont révélé le bug.
- **Portrait par défaut** (`ab937f5` puis `09f2535`) : `public/default-character.webp` (figure encapuchonnée 9:16) affiché sur les cards/fiches/MJ sans image.
- **Migration `next/image` + tout en WebP** (`09f2535`) : tous les `<img>` bruts → `next/image` (`fill` + `sizes` + `priority`), `remotePatterns` Supabase dans `next.config`, asset par défaut PNG→WebP (1,6 Mo → 33 Ko), upload ré-encode **toujours** en WebP. **Fix middleware** : le matcher n'excluait pas les assets statiques `public/` → l'optimiseur `next/image` (fetch sans cookie) se faisait rediriger vers `/login` (307) → image 400. Extensions d'images exclues du matcher.
- **Ménage** (`c1666bc`) : SVG par défaut de Next retirés de `public/`.
- Vérifs vertes à chaque étape : `tsc`, `vitest` 9/9, `next build`, navigateur desktop 1280 + mobile 390 (**0 erreur / 0 warning** console). Tout **poussé sur `origin/main`**.

### Reste à faire
- **Recréer le bucket `portraits` (public) sur la prod** avant tout usage réel — sinon l'upload d'avatar échoue avec « Bucket not found ».
- Le **visuel MJ** et l'avatar de **Coltar** ont été mis par Adrien (plus les images de test).
- Reste inchangé : durcir les secrets, Lot 3 (session live/dés), Lot 4 (prépa MJ), Lot 5 (compendium).

### Blockers
- Aucun.

### Décisions
- Cards accueil en **9:16, nom en surimpression** (vs bandeau sous l'image).
- **Portrait MJ uploadable** (singleton `Campaign`) plutôt que visuel décoratif fixe.
- **Toujours servir/stocker en WebP** via `next/image` (composant natif) + ré-encodage client à l'upload.
- Portrait par défaut partagé sur cards, fiche perso et en-tête MJ.

---

## Passe UI hero + fiches + page MJ (même jour, skill impeccable)

### Réalisé
- **Auth MJ désactivée temporairement** (`3e3e581`) : bloc de vérif du mot de passe MJ **commenté** dans `src/middleware.ts` avec `TODO(à remettre)`. `/mj` reste protégé par l'auth d'app. **⚠ à réactiver plus tard** (décommenter le bloc).
- **Accueil — card MJ format personnage** (`1074d52`) : sections titrées « Personnages » / « Meneur de jeu » (composant `SectionHeading` + trait moss). La card MJ prend le gabarit 9:16 des cards perso mais garde son identité (liseré/ring moss, badge bouclier, overlay teinté vert). Ancienne bannière horizontale retirée.
- **Fiche perso — bouton import + portrait mobile** (`8e28789`) : gros bouton beige → **bouton overlay « appareil photo »** en coin de la photo (`PortraitUpload` rendu flexible : `label`/`variant`/`size`/`className`). Portrait mobile agrandi.
- **Fiche perso — hero plein écran façon Steam** (`8e28789`) : en-tête transformé en hero **bord à bord** (breakout `w-screen` + `overflow-x:hidden` sur `body`). Fond = **même image adoucie** (`blur-md`, pas trop floue pour rester lisible), portrait net centré, **nom en surimpression** (kicker « Cairn ») sur dégradé bas, barre Accueil/Supprimer sur scrim, bouton photo overlay. Corps de la fiche sous le hero. Textes du hero agrandis sur desktop (`5bfd718` : nom `lg:text-6xl`, kicker, boutons).
- **Fiche perso — blocs regroupés + Épuisé** (`5bfd718`) : suppression de la carte englobante (fin des **cartes imbriquées**) → blocs = cartes sœurs sur parchemin. Stats chiffrées réunies dans une carte **« Caractéristiques »** (attributs + séparateur + Armure/Sous). **Épuisé** repositionné : case à cocher → **toggle de statut** proéminent, rouge (destructive) quand actif (état React contrôlé). Espacement Armure/Sous corrigé ensuite (`56d027f` : label+input regroupés/centrés, plus de `justify-between`).
- **Page MJ améliorée** (`6478ed6` puis `56d027f`) : en-tête d'abord compacté (résumé campagne, bouton photo overlay), **puis transformé en hero plein écran comme la fiche perso** (fond flou, portrait centré, identité « Meneur de jeu » + titre + résumé en surimpression). **Table des personnages enrichie** : vignettes de portrait par ligne, survol de ligne, ligne teintée si épuisé, colonne « État ». Titres de section unifiés (« Personnages »/« Notes secrètes »).
- Vérifs vertes à chaque étape (`tsc`, `next build`, navigateur desktop+mobile, 0 erreur console). Tout **poussé sur `origin/main`**.

### Reste à faire
- **⚠ Réactiver l'authentification MJ** (`src/middleware.ts`, bloc commenté `TODO(à remettre)`) quand la phase de test/démo sera finie.
- **Recréer le bucket `portraits` (public) sur la prod** (inchangé).
- Reste inchangé : durcir les secrets, Lot 3 (session live/dés), Lot 4 (prépa MJ), Lot 5 (compendium).

### Blockers
- Aucun.

### Décisions
- **Hero plein écran façon Steam** partagé fiche perso + page MJ (breakout `w-screen`, fond flou lisible, nom/identité en surimpression). Identité MJ portée par le bouclier + « Meneur de jeu », sinon même traitement.
- Fond du hero : **flou léger** (`blur-md`), on doit reconnaître l'image, pas un simple fond d'ambiance.
- **Épuisé = toggle rouge** (cohérent avec le badge du dashboard MJ), pas une case à cocher.
- **Pas de cartes imbriquées** sur la fiche : blocs = cartes sœurs, stats regroupées.

---

## Landing publique « façon jeu vidéo » (même jour)

Spec : `docs/superpowers/specs/2026-07-19-landing-publique-commencer-design.md`. Commits `d…`/`42c220e`.

### Réalisé
- **Landing publique plein écran** (`42c220e`) : `/` devient un écran de démarrage façon jeu vidéo — fond cinématique (portrait par défaut assombri + vignette), titre **Cairn** en gothique, sous-titre « Compagnon de campagne », bouton **Commencer**, animations d'entrée. Composant serveur statique, aucune donnée/cookie.
- **Dashboard déplacé sur `/table`** (protégé) : contenu de l'ancien `/` (grille perso + carte MJ) déplacé via `git mv` sans changement de logique.
- **Câblage flux** : `/` ajouté à `PUBLIC` du middleware ; `loginApp` redirige désormais vers `/table` ; 4 liens « retour accueil » repointés `/` → `/table` (`character/new`, `mj/page`, `CharacterSheet` ×2 dont `router.push` après suppression).
- **Vérifs vertes** : `next build` OK (`/` statique, `/table` présent), 9 tests vitest verts. Navigateur : `/` public affiche Cairn+Commencer ; `/table` sans cookie → 307 `/login` (curl) ; `/table` avec cookie → dashboard direct (« Continuer »).

### Reste à faire
- **Image de fond dédiée** pour la landing (actuellement le portrait par défaut dépanne) — emplacement déjà prêt dans `src/app/page.tsx`.

### Blockers
- Aucun.

### Décisions
- **`/` = landing publique**, dashboard sur `/table` (route de la « table » de JDR).
- **Commencer = `<Link href="/table">`** : aucune logique custom, le middleware gère entrée directe (cookie) ou mot de passe. Comportement « Continuer » d'un jeu vidéo.

### Maj — fond de la landing (fait)
- ✅ **Image de fond dédiée en place** (`fbd2435`) : `docs/landing1.png` (table de JDR : grimoire, carte, dés, plume) → `public/landing.webp` (2 Mo → 108 Ko via sharp). Cadrage `object-center`, overlay adouci pour garder l'ambiance chaude. Vérifié desktop + mobile. → le « Reste à faire : image de fond dédiée » est clos.
- Sources PNG de la landing ignorées dans git (`.gitignore : /docs/landing*.png`), gardées en local ; WebP versionné.

---

## Landing — finitions, login modale, metadata (même jour, suite)

Spec landing : `docs/superpowers/specs/2026-07-19-landing-publique-commencer-design.md`. Tout poussé sur `origin/main` (dernier commit `0eb0e53`).

### Réalisé
- **Placement titre/bouton** (`6be19d0`, `8666c93`) : titre remonté dans la zone de bois libre de l'image (`pt-[19vh]`), bouton **Commencer** ancré en bas via `mt-auto` + `pb-[11vh]` (grammaire d'écran de démarrage : titre haut / CTA bas).
- **Sous-titre** (`9ca2362`) : « Compagnon de campagne » → **« Carnet de campagne »** (rendu `UPPERCASE` lettré).
- **Login en modale sur la landing** (`c339a3a`) : *Commencer* ouvre une modale mot de passe **sans quitter la landing** (fond assombri + flouté). Déjà connecté → *Commencer* = lien direct `/table`. Erreur affichée **inline** via `useActionState` (`loginAppAction`, succès → `/table`, échec → `{error:true}`). Nouveau `components/ui/dialog.tsx` (Radix) + client `LandingStart.tsx`. La landing lit le cookie côté serveur (page passée en dynamique).
- **`/login` → landing + modale** (`ad1ba80`) : middleware et page `/login` redirigent vers `/?login=1` ; la landing ouvre la modale d'emblée sur ce param (`openLogin` → `defaultOpen`). `/login` n'est plus qu'une redirection (filet deep links). `loginApp` (devenu inutilisé) retiré.
- **Metadata optimisées** (`9c0e0a6`) : title template `%s · Cairn` + titres par page (La table, Meneur de jeu, Nouveau personnage, nom du perso via `generateMetadata`) ; description « Carnet de campagne » ; `metadataBase` (env `NEXT_PUBLIC_SITE_URL` → Vercel → localhost) ; **Open Graph + Twitter** complets ; `robots: noindex` (app privée) ; `viewport` themeColor `#e8e1cd` + `colorScheme: light` ; `appleWebApp`. **Image de partage générée** `opengraph-image.tsx` (1200×630), route rendue publique dans le middleware.
- **Police de marque sur l'image OG** (`be30b63`) : TTF **Pirata One** co-localisé (`src/app/PirataOne-Regular.ttf`), lu via `fs` (le `fetch` de `file://` casse au prerender). Titre + sous-titre de la carte en gothique.
- **Image desktop dédiée** (`0eb0e53`) : `landing-desk.png` (paysage) → `public/landing-desk.webp` (109 Ko). **Art direction responsive** via `<picture>` + `media` : paysage desktop / portrait mobile, une seule image téléchargée par viewport (remplace 2 `next/image`, warning console éliminé).
- Vérifs : `next build` vert, 9 tests vitest verts, rendus vérifiés desktop + mobile au navigateur (modale, erreur inline, succès, deep links, OG image).

### Reste à faire
- **Définir `NEXT_PUBLIC_SITE_URL`** sur l'hébergeur pour des liens OG absolus (sinon repli URL Vercel).
- Optionnel : **manifest PWA + icônes** (192/512) pour un vrai « installer l'app » (icônes à générer d'abord).
- Toujours ouvert (hérité) : réactiver l'auth MJ (`middleware.ts`, bloc `TODO(à remettre)`) ; recréer le bucket `portraits` (public) en prod ; durcir les secrets.

### Blockers
- Aucun.

### Décisions
- **`/` = landing publique** ; dashboard sur **`/table`** (protégé). *Commencer* = lien `/table`, le middleware gère entrée directe (cookie) vs mot de passe.
- **Login = modale sur la landing** (pas de page nue) ; `/login` conservé uniquement comme redirection filet. Erreur gérée inline (`useActionState`), pas de redirection.
- **App privée → `noindex`** assumé (facile à inverser).
- **Art direction responsive** en `<picture>` plutôt que 2 `next/image` (évite le double téléchargement).
- Sources PNG des images de landing **ignorées** dans git (`/docs/landing*.png`), seul le WebP est versionné.

---

## Favicon de marque + fix « changements disparus » (même jour, suite)

Tout poussé sur `origin/main` (dernier commit `f27d7ab`).

### Réalisé
- **Favicon custom** (`a8d356d`) : `icon.tsx` (32) + `apple-icon.tsx` (180) générés via `next/og`, **« C » en Pirata One sur fond rouille** (couleur du bouton *Commencer*). `favicon.ico` par défaut retiré. Routes `/icon` et `/apple-icon` ajoutées à `PUBLIC` du middleware (sinon redirigées → favicon cassé sur la landing publique).
- **Bug corrigé : modif de perso (nom/portrait) qui « disparaît »** (`f27d7ab`). **Racine** (régression du refacto landing) : le dashboard a été déplacé `/` → `/table`, mais les server actions revalidaient encore `revalidatePath("/")`. Or `/table` est **statique** → la liste restait figée au build (l'écriture en base, elle, passait bien ; la fiche `/character/[id]`, dynamique + revalidée, montrait le changement — d'où « ça marche puis ça disparaît » en revenant sur la liste). **Fix** : `create/update/delete` + portrait MJ revalident `/table` ; création/suppression revalident aussi `/mj` (également statique et listant les persos). Test `revalidate.test.ts` (spy `next/cache` + prisma mocké) : rouge avant, vert après. Suite 12/12, build vert.
  - **Note importante** : le bug ne se manifeste **qu'en prod** (en dev tout est dynamique). Après déploiement, le rebuild régénère `/table` depuis la base → les données déjà saisies réapparaissent.

### Reste à faire
- Inchangé : `NEXT_PUBLIC_SITE_URL` à définir en prod (liens OG absolus) ; manifest PWA + icônes (optionnel) ; réactiver l'auth MJ (`middleware.ts`, `TODO(à remettre)`) ; recréer le bucket `portraits` (public) en prod ; durcir les secrets.

### Blockers
- Aucun.

### Décisions
- **Icônes générées** (pas de fichiers binaires) via `next/og` + police co-localisée, cohérentes avec l'image OG.
- **Règle de revalidation** : toute mutation de la collection de personnages doit revalider **toutes** les vues statiques qui l'affichent — aujourd'hui `/table` **et** `/mj` (+ `/character/[id]` sur update). À retenir si d'autres pages listant les persos apparaissent.

---

## Champ « Sorts » sur la fiche + fix build Vercel (même jour, suite)

Tout poussé sur `origin/main` (dernier commit `f7bcb88`).

### Réalisé
- **Champ « Sorts »** ajouté à la fiche perso, à côté de Traits (`c250329`) : `sorts String @default("")` sur `Character` (juste après `traits`), migration `20260719192111_add_sorts_field` créée **et appliquée sur la base Supabase** (partagée → colonne déjà présente en prod, pas de step DB manuel). Bloc Textarea rendu après Traits dans la grille, autosave onBlur + tracking `useFieldSave` comme les autres blocs. `updateCharacter` prend un `data` libre → aucune modif d'action.
- **Fix build Vercel** (`f7bcb88`) : le déploiement de `c250329` a échoué au type-check (`Property 'sorts' does not exist on type 'CharacterWithItems'`). **Racine** : le Prisma Client généré vit dans `node_modules` (non commité) et Vercel **restaure son cache de build** → client stale, types sans `sorts` (en local ça passait car la migration avait régénéré le client). **Fix** : `prisma generate` ajouté en **`postinstall`** (couvre le cache restauré) **et** en tête du **`build`** (`prisma generate && next build`, ceinture). Build local revérifié vert.

### Reste à faire
- Inchangé : `NEXT_PUBLIC_SITE_URL` à définir en prod (liens OG absolus) ; manifest PWA + icônes (optionnel) ; réactiver l'auth MJ (`middleware.ts`, `TODO(à remettre)`) ; recréer le bucket `portraits` (public) en prod ; durcir les secrets.

### Blockers
- Aucun.

### Décisions
- **Règle build Prisma + Vercel** : toujours régénérer le client au build (`postinstall` + `build`), sinon le cache node_modules de Vercel sert un client obsolète après tout changement de schéma. À garder pour les prochaines migrations.
- Migrations appliquées depuis le poste local sur la base Supabase partagée → la colonne existe en prod dès le merge ; le déploiement n'a « que » à recompiler.
