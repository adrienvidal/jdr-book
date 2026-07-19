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
- **Durcir les secrets** avant tout usage réel : `AUTH_SECRET` est encore le placeholder ; `APP_PASSWORD="slip"` / `MJ_PASSWORD="admin"` sont faibles.
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
