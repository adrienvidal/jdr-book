# Landing publique « façon jeu vidéo » — Design

**Date :** 2026-07-19
**Statut :** validé, prêt pour plan d'implémentation

## Objectif

Ajouter une **page d'accueil publique** de type écran de démarrage de jeu vidéo :
titre du jeu (*Cairn*) + bouton **Commencer**. Cliquer sur *Commencer* mène à
l'application ; si le visiteur n'est pas connecté, le middleware existant lui
demande le mot de passe (`APP_PASSWORD`) avant de le laisser entrer.

## Contexte existant

- Next.js 16 (App Router), React 19, Tailwind v4, shadcn, auth par JWT (`jose`).
- Aujourd'hui `/` **est** le tableau de bord protégé (grille des personnages +
  carte MJ). Le middleware redirige vers `/login` tout ce qui n'est pas dans
  `PUBLIC = ["/login", "/mj/login"]`.
- `loginApp` (action serveur) pose le cookie `app_auth` puis redirige vers `/`.

## Architecture cible

| Route | Rôle | Accès |
|-------|------|-------|
| `/` | **Landing publique** (titre *Cairn* + bouton *Commencer*) | public |
| `/table` | Tableau de bord (grille perso + carte MJ) — contenu actuel de `/` | protégé |
| `/login` | Écran mot de passe (inchangé) | public |
| `/mj`, `/mj/login`, `/character/*` | Inchangés | inchangé |

### Changements de fichiers

1. **Déplacer le dashboard** : le contenu actuel de `src/app/page.tsx` va dans
   `src/app/table/page.tsx`, **sans modification de logique** (mêmes appels
   `listCharacters()` / `getCampaign()`, même JSX, même helper `SectionHeading`).
2. **Réécrire `src/app/page.tsx`** en landing publique (voir UI ci-dessous).
3. **Middleware** (`src/middleware.ts`) : ajouter `/` à `PUBLIC`
   → `PUBLIC = ["/", "/login", "/mj/login"]`.
4. **`loginApp`** (`src/app/actions/session.ts`) : destination `/` → `/table`.
   (`loginMj` reste sur `/mj`.)
5. **Repointer les liens « retour accueil »** de `/` vers `/table` :
   - `src/app/character/new/page.tsx:26` (`href="/"`)
   - `src/app/mj/page.tsx:65` (`<Link href="/">`)
   - `src/components/CharacterSheet.tsx:186` (`<Link href="/">`)
   - `src/components/CharacterSheet.tsx:139` (`router.push("/")` après suppression)

## Flux « Commencer »

`Commencer` = `<Link href="/table">`. Aucune logique custom sur la landing ;
le middleware fait tout :

```
Commencer ─► /table
             ├─ cookie app_auth valide ─► /table (entre direct, façon « Continuer »)
             └─ pas de cookie          ─► /login ─► mot de passe ─► /table
```

## UI de la landing (écran de démarrage plein écran)

- Conteneur plein viewport (`min-h-dvh`), contenu centré (vertical + horizontal),
  `relative overflow-hidden`.
- **Fond cinématique** : `default-character.webp` en `fill` / `object-cover`,
  assombri par un overlay (dégradé sombre + vignette), cohérent avec les hero
  « façon Steam » déjà présents (page MJ, fiches). Aucun nouvel asset requis ;
  l'image de fond reste facilement remplaçable plus tard.
- **Titre** *Cairn* très grand en `font-cairn` ; **sous-titre** « Compagnon de
  campagne ».
- **Bouton Commencer** : composant `Button` existant, `size="lg"`, proéminent,
  placé sous le titre, enveloppé dans `<Link href="/table">` (via `asChild`).
- Légère **animation d'entrée** (fade + montée) sur le titre et le bouton, dans
  l'esprit des transitions déjà utilisées (`tw-animate-css` disponible).
- Textes lisibles sur fond sombre (parchemin clair / `text-parch`), contraste
  suffisant.

La landing est un composant serveur statique : aucun appel de données, aucun
cookie lu côté page (elle est publique).

## Cas limites

- **Déjà connecté** : `Commencer` → `/table`, entre sans repasser par le mot de
  passe (middleware laisse passer sur cookie valide).
- **Non connecté** : `/table` → `/login` → `/table` après succès.
- **Accès direct à `/table` sans cookie** : comportement identique (middleware).
- **Assets** : le middleware exclut déjà `_next/image` et les extensions image du
  matcher, donc le fond `default-character.webp` de la landing publique se charge
  sans être intercepté.

## Tests / vérification

- **Vérif manuelle du flux** (navigateur) :
  1. Sans cookie : `/` s'affiche (public) → *Commencer* → `/login` → mot de passe
     → arrive sur `/table`.
  2. Avec cookie : `/` → *Commencer* → entre direct sur `/table`.
  3. Liens « retour » depuis fiche perso / page MJ mènent bien à `/table`.
- **Build & tests** : `npm run build` passe ; la suite `vitest` existante reste
  verte (aucune logique unitaire nouvelle ; pas de test middleware dédié).

## Hors périmètre (YAGNI)

- Pas de retour vers l'URL demandée après login (redirection simple vers
  `/table` suffit).
- Pas de nouvel asset image / vidéo de fond dédié (réutilise l'existant,
  remplaçable plus tard).
- Pas de refonte de `/login` ni de l'auth MJ (le bloc MJ reste désactivé comme
  aujourd'hui).
