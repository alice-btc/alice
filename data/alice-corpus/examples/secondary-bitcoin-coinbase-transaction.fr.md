---
type: "project_note"
id: "secondary-bitcoin-coinbase-transaction"
title: "La transaction coinbase"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Coinbase Transaction"]
parent_ids: ["block-reward", "bitcoin-transaction-input"]
related_ids: ["block-reward", "bitcoin-transaction-input"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB min101 — Introduction to Bitcoin mining"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# La transaction coinbase

## Questions couvertes

- Pourquoi la première transaction d’un bloc est-elle particulière ?

## Réponse courte

La coinbase est la première transaction du bloc et n'utilise pas une entrée ordinaire dépensant un ancien UTXO. Elle peut attribuer jusqu'à la subvention autorisée plus les frais du bloc.

## Explication

- Les entrées ordinaires dépensent des sorties antérieures ; la coinbase suit un format spécial lié au bloc.
- La somme qu’elle peut attribuer est encadrée par la subvention à cette hauteur et les frais du bloc ; les nœuds vérifient cette limite.

## Limites et confusions

Le mineur peut réclamer moins que le maximum ; les sorties sont soumises à maturité.

## Approfondissements

- [[block-reward.fr|La rémunération d’un bloc]] pour revenir à la notion de base.
- [[bitcoin-transaction-input.fr|Les entrées d’une transaction]] pour revenir à la notion de base.

## Références

- PlanB min101 — Introduction to Bitcoin mining
