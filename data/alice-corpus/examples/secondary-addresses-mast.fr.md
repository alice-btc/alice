---
type: "project_note"
id: "secondary-addresses-mast"
title: "Les arbres de conditions de dépense"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["addresses"]
aliases: ["MAST"]
parent_ids: ["taproot", "merkle-tree"]
related_ids: ["taproot", "merkle-tree"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les arbres de conditions de dépense

## Questions couvertes

- Comment Taproot peut-il ne révéler qu’une condition utilisée ?

## Réponse courte

MAST désigne l’idée d’organiser des branches de script dans un arbre de Merkle pour ne révéler que la branche utilisée.

## Explication

- Cela limite la révélation de conditions non utilisées.
- Taproot reprend cet esprit avec ses scripts alternatifs.
- MAST améliore confidentialité et efficience pour scripts complexes.
- Le concept relie Merkle trees et conditions de dépense.

## Limites et confusions

Révéler une seule branche ne masque pas toutes les métadonnées de la transaction.

## Approfondissements

- [[taproot.fr|Les adresses bc1p et Taproot]] pour revenir à la notion de base.
- [[merkle-tree.fr|Les arbres de Merkle]] pour revenir à la notion de base.

## Références

- PlanB cyp201 — Bitcoin Wallet Architecture
