---
type: "project_note"
id: "coin-control"
title: "Choisir les fonds à dépenser"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Coin Control"]
parent_ids: []
related_ids: ["coin-selection-tradeoffs", "utxo-labeling", "change-privacy-linking"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc204 — Privacy on Bitcoin", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Choisir les fonds à dépenser

## Questions couvertes

- À quoi sert le coin control ?

## Réponse courte

Le coin control permet de choisir quels UTXO financeront une transaction au lieu de laisser uniquement le portefeuille décider. Ce choix peut influencer les frais et les liens publiquement créés entre des fonds.

## Explication

Les UTXO peuvent provenir de contextes différents. Les réunir dans un paiement permet à un observateur de supposer un contrôle commun. Des étiquettes d’origine aident à comprendre ce que l’on rapproche, et à suivre la monnaie rendue issue d’une dépense.

Le nombre d’entrées compte aussi pour le poids. Sélectionner beaucoup de petits fonds peut augmenter les frais ; choisir un montant trop grand peut créer une nouvelle sortie de monnaie rendue.

## Limites et confusions

La sélection manuelle n’est pas automatiquement meilleure que celle du logiciel. Elle exige de comprendre les montants, les frais et les conséquences de confidentialité. Éviter un regroupement ne garantit pas l’absence d’autres liens par les adresses, les serveurs ou les données externes. Cette fiche expose les compromis plutôt qu’une règle universelle de sélection.

## Approfondissements

- [[coin-selection-tradeoffs.fr|Sélection des UTXO et compromis]].
- [[utxo-labeling.fr|Étiqueter ses UTXO]].
- [[change-privacy-linking.fr|Monnaie rendue et liens de confidentialité]].

## Références

- PlanB btc204 — Privacy on Bitcoin.
- PlanB Extraction — 2026-05-23.
