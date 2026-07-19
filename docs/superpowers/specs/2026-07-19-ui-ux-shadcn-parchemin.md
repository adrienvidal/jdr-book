# Spec — Passe UI/UX : shadcn rethémé « Parchemin fidèle » + responsive

**Date** : 2026-07-19
**Statut** : validé (design approuvé en brainstorming, exécution autorisée en `/loop`)

## Objectif

Faire une passe UI/UX sur **toutes** les interfaces de l'app Cairn :
1. adopter **shadcn/ui** comme couche de composants,
2. **rethéme** shadcn sur le thème parchemin existant (pas de look neutre par défaut),
3. rendre **tout responsive** (mobile-first → desktop),
4. corriger les vrais irritants UX au passage,
5. généraliser des **modals de confirmation** aux actions destructives.

Pas de nouvelle feature métier (dés, realtime, compendium = lots 3-5, hors scope).

## Décisions de cadrage

- **Intégration shadcn** = *rethéme parchemin*. Les variables shadcn (`--background`, `--foreground`, `--primary`, `--card`, `--border`, `--ring`, `--destructive`…) sont mappées sur les tokens Cairn (`--color-parch`, `--color-panel`, `--color-accent` rouille, `--color-moss` MJ, `--color-line`, `--color-ink`). Polices Cairn (Pirata One / EB Garamond) conservées.
- **Dark mode** = non. Univers clair unique, choix d'identité assumé.
- **Ambition** = restyle + responsive + fixes UX (pas de feature).
- **Aucune régression fonctionnelle** : Server Actions, pattern non-contrôlé `defaultValue`+`onBlur`, middleware, schéma Prisma et tests Vitest inchangés. On ne touche qu'à la couche présentation.

## Socle technique

- shadcn/ui en **Tailwind v4** (variables CSS dans `globals.css`, pas de `tailwind.config.js`).
- Utilitaire `cn()` (`clsx` + `tailwind-merge`) dans `src/lib/utils.ts`.
- Composants installés : `button`, `card`, `input`, `textarea`, `label`, `checkbox`, `dialog`, `alert-dialog`, `slider` (option fatigue), `sonner` (toasts), `badge`, `separator`.
- Icônes : `lucide-react`.
- Chaque composant généré est retouché pour l'accent rouille + texture papier si nécessaire ; sinon le thème passe par les variables.

## Surfaces (6 écrans)

| Écran | Fichier | Changements |
|---|---|---|
| Login app | `src/app/login/page.tsx` | `Card` + `Input` + `Button` shadcn, erreur lisible, focus. |
| Login MJ | `src/app/mj/login/page.tsx` | Idem, accent **mousse** (repère côté MJ). |
| Accueil | `src/app/page.tsx` | Grille persos en `Card` responsive `2→3→4` col, état vide soigné, tuile MJ. |
| Nouveau perso | `src/app/character/new/page.tsx` | `Card` + `Label`/`Input`, bouton avec état `pending`. |
| Fiche perso | `src/components/CharacterSheet.tsx` | Cœur : responsive complet, attributs `2→4` col, fatigue rethémée, Dialog suppression, upload clarifié, toast de sauvegarde. |
| Dashboard MJ | `src/app/mj/page.tsx` + `MjNotes.tsx` | Tableau responsive (cartes empilées mobile / table desktop), notes en `Card` mousse. |

## Modals de confirmation (pattern généralisé)

`AlertDialog` rethémé Cairn pour toute action **irréversible** :

| Action | Avant | Après |
|---|---|---|
| Supprimer le personnage | `confirm()` natif | `AlertDialog` « Supprimer définitivement *Nom* ? » |
| Supprimer un objet (`✕` inventaire) | suppression immédiate, aucun filet | `AlertDialog` « Retirer *Nom* de l'inventaire ? » |
| Supprimer une note secrète (`✕` MJ) | suppression immédiate | `AlertDialog` « Supprimer cette note ? » |

**Anti-friction** : un objet / une note **encore vide** (nom non saisi) se supprime directement, sans dialog. La confirmation ne se déclenche que quand il y a du contenu à perdre.

Boutons non-destructifs (Ajouter, + Nouvelle note, Importer, Créer, Connexion) : pas de confirmation.

## Irritants UX corrigés

- **Feedback de sauvegarde** : `onBlur` sauve en silence → **toast `sonner`** « Enregistré » (discret, un seul à la fois).
- **Surcharge inventaire (> 10 slots)** : texte brut → `Badge`/bandeau accent visible.
- **Accessibilité** : `Label` liés aux champs, `focus-visible` cohérent, `aria-label` conservés.

## Responsive (règles)

- Mobile-first. Points de rupture Tailwind `sm` / `md` / `lg`.
- Fiche : en-tête portrait+nom en colonne < `sm` ; attributs `grid-cols-2` → `sm:grid-cols-4` ; blocs texte `1` → `md:2`.
- Dashboard MJ : `< md` cartes empilées, `≥ md` tableau.
- Aucune scroll horizontale du body ; contenus larges (table) dans un conteneur `overflow-x-auto`.

## Vérification (jusqu'à « overkill »)

- `npx tsc --noEmit` vert.
- `npm test` (Vitest) vert — logique inchangée, tests existants doivent passer.
- Test navigateur (`webapp-testing`/Playwright) des 6 écrans en **viewport mobile ET desktop** : rendu, responsive, modals de confirmation, toasts, pas d'overflow horizontal.
- Vérif visuelle que l'identité parchemin est préservée (accent rouille, polices Cairn, texture papier).

## Hors scope (YAGNI)

Dark mode, lanceur de dés, temps réel, PNJ/monstres, compendium SRD, refonte du modèle de données, durcissement des secrets (noté au backlog, séparé).
