# CLAUDE.md

## Skills

Avant d'agir sur une tâche, vérifier si un skill installé est pertinent et l'utiliser le cas échéant. Les skills de process passent avant les skills d'implémentation.

Repères pour ce projet :
- Concevoir une feature → `superpowers:brainstorming`, puis `superpowers:writing-plans` / `superpowers:executing-plans`.
- Corriger un bug → `superpowers:systematic-debugging`.
- Implémenter une feature à moindre coût en tokens → `lean-development`.
- Écrire/modifier de l'UI → un skill frontend (`frontend-design`, `impeccable`, `ui-ux-pro-max`, `theme-factory`).
- Tester dans le navigateur → `webapp-testing` ; écrire du code de test → `superpowers:test-driven-development`.
- Docs sur une lib/framework → serveur MCP `context7` plutôt que la mémoire.

## Session Continuity

En début de session :
- Lire le fichier de la dernière session dans `.claude/sessions/`
- Identifier où on s'est arrêté et les blockers en cours
- Résumer en 3 lignes avant de commencer

En fin de session :
- Sauvegarder un résumé dans `.claude/sessions/[date]_[sujet].md`
- Inclure : Réalisé, Reste à faire, Blockers, Décisions
- Si un fichier existe déjà pour aujourd'hui, le compléter plutôt que le remplacer

Format du nom de fichier : `YYYY-MM-DD_sujet-en-kebab-case.md`
Exemple : `2026-03-10_audit-cabinet-merlin.md`

Règles :
- Toujours lire AVANT d'agir – ne pas redemander ce qui est déjà documenté
- Les blockers non résolus de la session précédente deviennent la priorité
- Quand un blocker est levé, le noter explicitement dans "Réalisé"

Ajoute une instruction dans MEMORY.md pour que tu pense à chercher le fichier claude/sessions du jour automatiquement en début de session.

### Archivage des sessions

Le dossier `.claude/sessions/` ne garde visibles à la racine que les sessions utiles à la reprise. Les autres vont dans `.claude/sessions/archive/`.

- **Garder actives** : les 3 sessions les plus récentes, plus toute session rattachée à un dossier ou un deal encore ouvert.
- **Archiver, ne pas supprimer** : déplacer via `git mv` vers `archive/` (réversible, tracé dans git). Une session est archivable quand elle est close et que son contenu vit déjà ailleurs (code, règles, fiche client, playbook, CRM, git).
- **Filet anti-oubli, impératif** : avant d'archiver une session, reporter chacun de ses « Reste à faire » encore ouverts dans `.claude/sessions/reste-a-faire.md` (le backlog vivant, jamais archivé). Ne jamais archiver une session tant qu'un item ouvert n'a pas été soit fait, soit reporté dans ce backlog. Cocher puis retirer un item du backlog quand il est fait.
- **Quand** : en fin de session, après avoir sauvegardé le résumé du jour, vérifier si d'anciennes sessions sont devenues archivables et les déplacer.
- **Ne jamais toucher** au « Reste à faire » de la session active la plus récente : c'est la liste de priorités vivante.
- **Hygiène de fond** au passage : corriger une contradiction à sa source (pas seulement dans le dernier fichier), refermer un « Reste à faire » qu'une session ultérieure a accompli, signaler une info devenue fausse (par exemple un agent supprimé depuis).
- **Toute suppression ou déplacement se confirme avec Adrien** avant d'agir (cf. règle d'autonomie de l'orchestrateur).

Rappel : les fichiers de session sont un journal de passation, pas la mémoire vivante.

Ajoute une instruction dans MEMORY.md pour que tu pense à chercher le fichier claude/sessions du jour automatiquement en début de session.
