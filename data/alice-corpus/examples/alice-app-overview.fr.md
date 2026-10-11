---
type: "project_note"
id: "alice-app-overview"
title: "Se repérer dans Alice App"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["alice-app", "learning"]
aliases: ["les espaces d’Alice", "navigation dans Alice"]
parent_ids: []
related_ids: ["alice-explorer", "alice-learn", "alice-playground", "alice-offline-limits"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["alice-repo:apps/app-web/src/components/Sidebar.tsx", "alice-repo:apps/app-web/src/components/ExplorerPanel.tsx", "alice-repo:apps/app-web/src/components/LearnPanel.tsx", "alice-repo:apps/app-web/src/lib/playground.ts", "alice-repo:apps/app-web/src/components/settings/AiTab.tsx"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# Se repérer dans Alice App

## Questions couvertes

- À quoi servent Chat, Explorer, Learn et Playground ?
- Par où commencer pour découvrir Bitcoin avec Alice ?

## Réponse courte

Alice App propose 4 espaces complémentaires. Chat sert à poser des questions, Explorer à observer des données, Learn à suivre des cours et Playground à pratiquer avec des sats de test.

## Explication

Dans Chat, on échange avec l’assistant pour demander une explication ou approfondir une notion.

Explorer permet de chercher des transactions, des adresses ou des blocs, et d’observer certains indices de confidentialité. L’accompagnement par IA y est facultatif.

Learn rassemble des cours et tutoriels, avec des chapitres, des quiz lorsqu’ils sont disponibles et un suivi de progression. On peut solliciter Alice pour éclaircir un passage.

Playground propose un portefeuille de pratique sur Mutinynet. Il permet de découvrir des opérations on-chain sans utiliser des bitcoins du réseau principal.

## Limites et confusions

Les fonctions n’ont pas toutes les mêmes besoins de connexion. Disposer d’une IA locale ne rend pas les données récentes de la chaîne disponibles hors ligne. Une réponse de l’assistant peut aussi nécessiter une vérification.

## Approfondissements

- [[alice-explorer.fr|Comprendre Explorer]].
- [[alice-learn.fr|Apprendre avec Learn]].
- [[alice-playground.fr|Le wallet playground d’Alice App]].
- [[alice-offline-limits.fr|Les limites du mode hors ligne]].

## Références

- Navigation `alice-repo:apps/app-web/src/components/Sidebar.tsx`.
- Espaces `alice-repo:apps/app-web/src/components/ExplorerPanel.tsx`, `alice-repo:apps/app-web/src/components/LearnPanel.tsx` et `alice-repo:apps/app-web/src/lib/playground.ts`.
- IA `alice-repo:apps/app-web/src/components/settings/AiTab.tsx`.
- Références produit privées, version suivie dans le registre de provenance.
