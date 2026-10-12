---
type: "project_note"
id: "secondary-bitcoin-utxo-vs-account-based-model"
title: "Les UTXO comparés aux comptes"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["UTXO vs Account-Based Model"]
parent_ids: ["bitcoin-utxo", "bitcoin-transaction-structure"]
related_ids: ["bitcoin-utxo", "bitcoin-transaction-structure"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB sid406 — Mastering Liquid Development"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les UTXO comparés aux comptes

## Questions couvertes

- Quelle différence entre des sorties à dépenser et un solde de compte ?

## Réponse courte

Le modèle UTXO consomme des sorties et en crée de nouvelles, tandis qu'un modèle à comptes modifie des soldes ou états attachés aux comptes.

## Explication

- Le modèle UTXO favorise une construction transactionnelle explicite : inputs, outputs, conditions de dépense.
- Le modèle account-based facilite certains patterns applicatifs, mais concentre l’état dans des comptes et contrats.
- Liquid hérite du modèle UTXO et y ajoute assets et confidentialité.
- Le développeur doit gérer sélection d’UTXO, blinding, frais, remboursements et signatures partielles.

## Limites et confusions

Les compromis dépendent de l'application ; aucun des modèles n'élimine toutes les erreurs ou fuites de confidentialité.

## Approfondissements

- [[bitcoin-utxo.fr|Comprendre les UTXO]] pour revenir à la notion de base.
- [[bitcoin-transaction-structure.fr|Lire une transaction dans un explorateur]] pour revenir à la notion de base.

## Références

- PlanB sid406 — Mastering Liquid Development
