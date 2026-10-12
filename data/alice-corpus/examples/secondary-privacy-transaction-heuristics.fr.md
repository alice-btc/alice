---
type: "project_note"
id: "secondary-privacy-transaction-heuristics"
title: "Les indices utilisés par l’analyse de chaîne"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Transaction Heuristics"]
parent_ids: ["bitcoin-chain-analysis", "common-input-ownership-heuristic"]
related_ids: ["bitcoin-chain-analysis", "common-input-ownership-heuristic"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB btc204 — Privacy on Bitcoin"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les indices utilisés par l’analyse de chaîne

## Questions couvertes

- Une analyse de transaction prouve-t-elle qui possède les fonds ?

## Réponse courte

Les heuristiques de transaction sont des règles d’inférence utilisées pour interpréter une transaction Bitcoin : identifier le paiement, la monnaie rendue, les inputs liés, le type de wallet ou un comportement spécifique. Elles ne prouvent pas une identité, mais orientent l’analyse.

## Explication

- Les heuristiques internes examinent montants, outputs, scripts, ordre, similarités et formes de transaction.
- Les heuristiques externes exploitent données KYC, horaires, adresses réutilisées, informations publiques ou fuites.
- Une heuristique peut être trompée par des transactions collaboratives ou des wallets qui évitent les patterns standards.
- Plusieurs heuristiques combinées peuvent fortement réduire l’incertitude.

## Limites et confusions

Une corrélation ou estimation d’appartenance n’est pas une preuve suffisante d’identité.

## Approfondissements

- [[bitcoin-chain-analysis.fr|L’analyse de chaîne]] pour revenir à la notion de base.
- [[common-input-ownership-heuristic.fr|L’hypothèse des entrées communes]] pour revenir à la notion de base.

## Références

- PlanB btc204 — Privacy on Bitcoin
