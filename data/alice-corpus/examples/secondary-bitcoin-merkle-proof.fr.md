---
type: "project_note"
id: "secondary-bitcoin-merkle-proof"
title: "Les preuves de Merkle"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Merkle Proof"]
parent_ids: ["merkle-tree", "spv-node"]
related_ids: ["merkle-tree", "spv-node"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pro202 — Programming Bitcoin"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les preuves de Merkle

## Questions couvertes

- Que prouve l’inclusion d’une transaction dans un bloc ?

## Réponse courte

Une preuve de Merkle permet de vérifier qu'une donnée figure dans l'arbre associé à une racine connue, sans télécharger toutes les feuilles.

## Explication

- La taille de la preuve croît logarithmiquement avec le nombre de transactions.
- Les clients légers peuvent l’utiliser avec les headers de bloc.
- Elle ne prouve pas seule que la transaction est valide, seulement son inclusion dans un bloc donné.
- Taproot réutilise l’idée pour révéler seulement une branche de conditions de dépense.

## Limites et confusions

L'inclusion d'une transaction dans un bloc ne prouve pas à elle seule la validité du bloc ni l'absence de double dépense.

## Approfondissements

- [[merkle-tree.fr|Les arbres de Merkle]] pour revenir à la notion de base.
- [[spv-node.fr|La vérification légère]] pour revenir à la notion de base.

## Références

- PlanB pro202 — Programming Bitcoin
