# Session 2026-07-21 — Reel Instagram Cairn (+ install skills vidéo)

But : produire une story/reel Instagram présentant l'app **Cairn**, à montrer aux amis, signé **Viloris.io**.

## Réalisé

### Skills vidéo installés (scope global)
- `heygen-com/hyperframes` + `remotion-dev/skills` installés via `npx skills add`, d'abord en projet puis rebasculés en **global** (`~/.claude/skills/`).
- Décision : **HyperFrames seul**, Remotion pur retiré (les deux se recouvrent). `remotion-to-hyperframes` conservé (fait partie de HyperFrames).

### Reel Cairn — 2 approches
1. **Mockup reconstruit dans HyperFrames** (1re tentative) : storyboard « on ouvre le grimoire » → roster → app, tokens réels (parchemin, Pirata One + EB Garamond), portraits animés compositer. Rendu ~34 s. **Rejeté par Adrien** (« pas terrible, mieux vaut les vraies vues »).
2. **Vraies vues de l'app filmées** (retenu) : pipeline maison, sans éditeur externe ni HeyGen.

### Pipeline final (reproductible)
- **Capture** : Playwright headless (Node), viewport mobile 540×960, login `slip`, badge dev Next masqué. Vues filmées : landing, `/table` (scroll), fiche Elayne + Coltar (scroll), `/character/new` (création → **écran nouveau perso avec image par défaut**, perso test « Kael Ombreval » créé puis **supprimé**), `/mj`.
- **Overlays PIL** (vraies polices Pirata One / EB Garamond) : titre d'ouverture, plaques-noms roster, carte de fin.
- **Montage ffmpeg** : `xfade` (fondu / slide roster / travel), `overlay`/`drawbox` (plaques). Sortie H.264 1080×1920 30 fps CRF 18, **muet**.
- Vidéos réelles utilisées en direct : `landing-mobile-start.mp4` (ouverture illumination), `portraits/*.mp4` (roster), `landing-mobile.mp4` (fond carte de fin).

### Structure du reel (~38 s) — cf. `STORYBOARD-REEL.md`
Écran-titre → livre s'illumine · **Roster** : Game Master (5 s, en tête) → Coltar → Elayne (boule magique) → Kezac → Lotus (chat miaule) · Carnet `/table` (4 s) · Fiche Elayne (défilé complet) · Création (image par défaut) · Vue Game Master `/mj` · **Le Meneur plein cadre (sourire malicieux)** → **fondu 1 s** → Carte de fin (Cairn · un projet · viloris.io).

### Livrables
- **`videos/story-cairn/renders/cairn-story-reel.mp4`** — le reel (~37,7 s, 1080×1920, muet).
- **`videos/story-cairn/STORYBOARD-REEL.md`** — storyboard écrit, synchronisé avec le montage.
- **`videos/story-cairn/pipeline/`** — scripts (`capture.js`, `capture-creation.js`, `assemble2.py`), clips capturés (`clips/*.webm`), overlays PNG, polices TTF → permet de re-monter sans re-capturer.
- Ancien projet HyperFrames (mockup) toujours dans `videos/story-cairn/` (compositions, index.html) — non utilisé pour le livrable final.

## Reste à faire
- **Musique** : à choisir dans Instagram au post. Reco donnée : **épique-cinématique** (colle à l'ambiance ; ex. « Enemy » Imagine Dragons × JID) ou **phonk/versus** (colle au roster). Non tranché. Caler le drop sur l'arrivée du Game Master (~5 s). Attention bibliothèque limitée sur compte pro/business.
- **Verrouillage** non formalisé : Adrien peut encore vouloir des retouches (durée ~38 s jugée un peu longue — option : réduire fiche/MJ ou GM à 4 s).

## Blockers
- Aucun bloquant. (Serveur dev Next arrêté en fin de session — à relancer via `npm run dev` si nouvelle capture.)

## Décisions
- Vidéo = **vraies vues de l'app**, pas de mockup, pas d'éditeur externe (CapCut écarté), pas de HeyGen (crédits API payants).
- **Muet**, musique ajoutée dans Instagram (cf. mémoire `video-audio-heygen`).
- Le **Game Master** est présenté comme un perso du roster (nom « Game Master »), en tête, 5 s ; il reparaît en plein cadre (sourire malicieux) juste avant la fin.
- Carte de fin signée **Viloris.io** (« un projet Viloris »), bookend de l'ouverture bougie.
- `devIndicators:false` (masquage badge dev pendant capture) **retiré** de `next.config.ts` en fin de session → repo propre. Le badge est retiré via ce flag si on re-capture : à re-ajouter temporairement le cas échéant.
- `.gitignore` : `/videos/` ajouté (le projet vidéo ne pollue pas git) — changement laissé non commité.
