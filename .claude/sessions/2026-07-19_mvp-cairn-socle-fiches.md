# Session 2026-07-19 — MVP Cairn : socle + fiches

## Réalisé
- Cadrage complet (brainstorming → spec → plan) :
  - `docs/superpowers/specs/2026-07-19-jdr-cairn-mvp-design.md`
  - `docs/superpowers/plans/2026-07-19-jdr-cairn-mvp.md`
- Implémentation du MVP (lots 1+2), 11 tâches, vérifié end-to-end au navigateur :
  - Accès : mot de passe app + 2e mot de passe MJ (cookies JWT signés `jose`, middleware `src/middleware.ts`).
  - Modèle Prisma `Character`/`Item`/`Note` aligné sur la fiche FR (FOR/DEX/VOL/PV, Passé, Épuisé·e, Armure, Sous, Petits Objets, Inventaire 1-10, Fatigue).
  - Accueil en cards + création de perso ; fiche éditable par tous (onBlur) ; inventaire + compteur de slots (alerte > 10) ; import portrait (Supabase Storage) ; dashboard MJ + notes secrètes.
  - 9 tests Vitest verts (auth, slots, actions persos, actions notes), `tsc --noEmit` OK.
- Git : dépôt initialisé en 2 commits (base sur `main`, feature sur `feat/mvp-cairn`), poussés sur `origin`.

## Reste à faire
- **Ouvrir la PR** : https://github.com/adrienvidal/jdr-book/pull/new/feat/mvp-cairn (gh non installé).
- **Supprimer le perso de test « Aelric »** créé pendant les tests (encore dans la base Supabase) — via le bouton Supprimer de sa fiche.
- **Durcir les secrets** avant tout usage réel : `AUTH_SECRET` est encore le placeholder ; `APP_PASSWORD="slip"` / `MJ_PASSWORD="admin"` sont faibles.
- Lots suivants (non commencés) : lot 3 session live (temps réel + lanceur de dés), lot 4 prépa MJ (PNJ/monstres/scénario), lot 5 compendium SRD.

## Blockers
- Aucun bloquant actif. (`gh` absent = PR à ouvrir via le web, pas un blocker.)

## Décisions
- Système : **Cairn 2e** (rules-light). App **mono-campagne**, pas de comptes individuels.
- Accès **option B** : fiches ouvertes en lecture/édition à tous, interface MJ derrière un 2e mot de passe.
- **Prisma figé en v6** : Prisma 7 impose des driver-adapters + `prisma.config.ts` (trop de friction).
- Champs contrôlés **non-contrôlés** (`defaultValue` + `onBlur`) pour éviter les conflits d'état avec `revalidatePath`.
- Middleware dans **`src/middleware.ts`** (obligatoire avec un dossier `src/`).
- Cookies `secure` conditionnés à la production (sinon refus en http local).
