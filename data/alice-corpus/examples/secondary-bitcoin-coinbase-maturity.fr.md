---
type: "project_note"
id: "secondary-bitcoin-coinbase-maturity"
title: "La maturité des récompenses de bloc"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Coinbase Maturity"]
parent_ids: ["block-reward", "bitcoin-transaction-confirmation"]
related_ids: ["block-reward", "bitcoin-transaction-confirmation"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB min101 — Introduction to Bitcoin mining"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# La maturité des récompenses de bloc

## Questions couvertes

- Quand un mineur peut-il dépenser les sorties de sa transaction coinbase ?

## Réponse courte

Une sortie coinbase créée à la hauteur h ne peut être dépensée dans un bloc avant h + 100.

## Explication

- Les sorties de la transaction coinbase ont un délai particulier avant leur dépense, distinct des paiements ordinaires.
- Ce délai réduit certaines conséquences d’une disparition de récompense lors d’une réorganisation récente.

## Limites et confusions

Cette règle ne rend pas impossible une réorganisation plus profonde et ne s'applique pas à toutes les sorties ordinaires.

## Approfondissements

- [[block-reward.fr|La rémunération d’un bloc]] pour revenir à la notion de base.
- [[bitcoin-transaction-confirmation.fr|Les confirmations]] pour revenir à la notion de base.

## Références

- PlanB min101 — Introduction to Bitcoin mining
