---
type: "project_note"
id: "pruned-node"
title: "Le nœud élagué"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["nodes"]
aliases: ["Pruned Node"]
parent_ids: []
related_ids: ["full-node", "pruned-node-history", "node-initial-sync"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc202 — Setting up your first Bitcoin node", "PlanB Extraction — 2026-05-23 — lnp404"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Le nœud élagué

## Questions couvertes

- Peut-on vérifier Bitcoin sans stocker tous les anciens blocs ?

## Réponse courte

Un nœud élagué vérifie Bitcoin puis supprime une partie des anciens fichiers de blocs pour réduire l’espace disque. Il conserve l’état nécessaire à la validation des nouveaux blocs.

## Explication

L’élagage sépare validation et conservation de l’historique. Le nœud ne transforme pas les anciens blocs en éléments invalides ; il cesse simplement de garder certaines de leurs données sur son disque. Cela permet de réduire les besoins de stockage sans remplacer la validation par une simple confiance dans un serveur.

Cette économie limite en revanche certaines recherches historiques et certains services d’indexation. Le logiciel doit retrouver ailleurs les données supprimées lorsqu’un nouvel usage en a besoin.

## Limites et confusions

Élagué ne signifie pas SPV. La récupération d’un ancien bloc dépend des pairs, du logiciel et de leur disponibilité. Selon l’opération, un bloc précis peut suffire ou davantage d’historique peut être nécessaire. Il est donc imprécis d’affirmer qu’il faut toujours tout télécharger à nouveau ou qu’un ancien bloc sera toujours immédiatement accessible.

## Approfondissements

- [[full-node.fr|La validation complète]].
- [[pruned-node-history.fr|Élagage et accès à l’historique]].
- [[node-initial-sync.fr|Comprendre la première synchronisation]].

## Références

- PlanB btc202 — Setting up your first Bitcoin node.
- PlanB Extraction — 2026-05-23 — lnp404.
