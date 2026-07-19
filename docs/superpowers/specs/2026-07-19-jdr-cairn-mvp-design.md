# JDR Cairn — MVP (Socle + Fiches de personnage)

**Date :** 2026-07-19
**Système :** Cairn 2e (rules-light OSR) — https://cairnrpg.com/second-edition/
**Stack :** Next.js (App Router, TypeScript) + Prisma + Supabase (Postgres + Storage)

## 1. Contexte & périmètre

App dédiée à **une seule campagne Cairn en cours** (pas une plateforme multi-tables).
La partie a déjà commencé, les personnages existent déjà sur papier ; l'app les
numérise et permet de les consulter/éditer, plus une interface MJ.

Cycle complet visé à terme (prépa → partie → suivi), découpé en lots :

| # | Lot | Statut |
|---|---|---|
| 1 | Socle : accès + écran d'accueil (cards) | **MVP** |
| 2 | Fiches de personnage Cairn | **MVP** |
| 3 | Session live (temps réel, lanceur de dés) | plus tard |
| 4 | Prépa MJ (PNJ, monstres, scénario) | plus tard |
| 5 | Compendium SRD Cairn | plus tard |

**Ce doc couvre uniquement le MVP = lots 1 + 2.**

## 2. Décisions produit validées

- **Pas de comptes individuels.** Un mot de passe partagé pour entrer dans l'app.
- **Écran d'accueil** = grille de cards (une par personnage + une card MJ).
  Clic sur une card perso → sa fiche ; clic sur la card MJ → interface MJ.
- **Contrôle d'accès (option B) :** interface MJ derrière un **2e mot de passe** ;
  les fiches persos sont **ouvertes en lecture ET en édition à tout le monde**.
- **Création/édition des persos :** tout le monde peut créer une card et éditer
  n'importe quelle fiche.
- **Interface MJ v1 :** tableau de bord de tous les persos (PV, attributs, statut)
  + notes secrètes (CRUD).
- **Portrait :** import de fichier image (Supabase Storage).
- **Pas de lanceur de dés** en v1 (repoussé au lot 3).
- **Pas de temps réel** en v1 : sauvegarde en base, dernier qui écrit gagne.

## 3. Modèle de données (Prisma / Postgres)

Champs alignés sur la fiche officielle FR (FOR/DEX/VOL/PV, Passé, Épuisé·e,
Armure, Sous, Petits Objets, Inventaire 1-10, Fatigue, Traits/Liens/Présages/Notes).

### `Character`
- `id`, `createdAt`, `updatedAt`
- `name` (Nom)
- `imageUrl` (portrait, optionnel — fichier dans Supabase Storage)
- `passe` (Passé / background) — texte
- Attributs, courant + max (ils baissent puis se soignent) :
  - `force` / `forceMax` *(nommé `force`, pas `for` — mot réservé)*
  - `dex` / `dexMax`
  - `vol` / `volMax`
  - `pv` / `pvMax`
- `armure` (int)
- `sous` (int — argent)
- `epuise` (bool — Épuisé·e / Deprived)
- `fatigue` (int — marqueurs de fatigue, occupent des slots d'inventaire)
- `traits`, `liens`, `presages`, `notes` — texte libre
- Relation → `items[]`

### `Item` (inventaire)
- `id`, `characterId`, `name`
- `slots` (int) : `0` = petty (→ zone **Petits Objets**) / `1` = normal / `2` = lourd
  (les objets ≥ 1 slot vont dans l'**Inventaire** numéroté 1-10)
- `kind` : `arme` | `armure` | `equipement` | `grimoire`
- `degats` (string, ex. `"d6"`, nullable — pour les armes)
- `armorValue` (int, nullable — pour les armures)
- `uses` (int, nullable — charges)
- `description` (texte)

**Règle de slots :** l'app calcule `somme(items.slots) + fatigue` et **alerte si > 10**.
Les **sorts** sont des items `kind = grimoire` avec une `description` (fidèle à Cairn,
pas de table de sorts séparée).

### `Note` (notes secrètes MJ)
- `id`, `title`, `content`, `updatedAt`

Les mots de passe ne sont **pas** en base → variables d'environnement
(`APP_PASSWORD`, `MJ_PASSWORD`).

## 4. Écrans & routes

- `/login` — champ mot de passe app. Si cookie valide, l'utilisateur ne le voit pas.
- `/` — **accueil** : grille de cards (persos + card MJ) + bouton
  « Ajouter un personnage » (ouvert à tous).
- `/character/[id]` — **fiche** : vue + édition inline. Sections fidèles à la fiche FR :
  identité + portrait, FOR/DEX/VOL/PV (courant/max), Armure, Sous, Épuisé·e,
  Petits Objets, Inventaire 1-10 avec **compteur de slots** (+ fatigue),
  Traits / Liens / Présages / Notes. Ouvert à tous.
- `/character/new` — création d'un perso (ou modale depuis l'accueil).
- `/mj` — **interface MJ** (derrière 2e mot de passe) :
  - tableau de bord : tous les persos (nom, PV/PVmax, FOR/DEX/VOL, épuisé, slots utilisés)
  - CRUD des notes secrètes.
- `/mj/login` — champ 2e mot de passe.

## 5. Contrôle d'accès (approche A validée)

- **Middleware Next.js** : toute route (sauf `/login`, `/mj/login`, assets) exige le
  cookie `app_auth`.
- `/mj/*` exige **en plus** le cookie `mj_auth`.
- Login = Server Action qui compare la saisie à `APP_PASSWORD` / `MJ_PASSWORD`, puis
  pose un **cookie httpOnly signé (HMAC)**. Aucun secret exposé côté client.
- Pas de Supabase Auth (pas de comptes).

## 6. Détails techniques

- **Mutations** via Server Actions (pas d'API REST à maintenir).
- **Prisma** vers Supabase Postgres (chaîne de connexion avec pooler pour le serverless).
- **Supabase Storage** : bucket `portraits` pour les images de perso ; l'app stocke
  l'URL publique dans `Character.imageUrl`.
- **Tailwind CSS** pour l'UI en cards.
- **Thème visuel** : direction Cairn (sombre, médiéval-forestier, sobre) — calée à
  l'implémentation.

## 7. Hors périmètre MVP (lots suivants)

Temps réel (Supabase Realtime), lanceur de dés résolvant les jets *roll-under*,
création guidée avec tables de dés, compendium SRD, PNJ/monstres/scénario,
automatisation des Scars.

## 8. Critères de succès du MVP

1. J'entre le mot de passe app → j'arrive sur l'accueil avec les cards.
2. Je crée un personnage, je remplis sa fiche Cairn (avec portrait importé), je sauvegarde,
   je reviens : les données persistent.
3. N'importe qui peut éditer n'importe quelle fiche.
4. Le compteur de slots d'inventaire alerte au-delà de 10.
5. La card MJ demande un 2e mot de passe ; derrière, je vois le tableau de bord des
   persos et je peux créer/éditer/supprimer des notes secrètes.
6. Un joueur sans le 2e mot de passe ne peut pas atteindre `/mj`.
