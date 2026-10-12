---
type: "project_note"
id: "secondary-bitcoin-dual-funded-channels"
title: "Les canaux financés par les 2 participants"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Dual-Funded Channels"]
parent_ids: ["lightning-channel", "lightning-liquidity"]
related_ids: ["lightning-channel", "lightning-liquidity"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pro101 — Bitcoin Development Fundamentals"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les canaux financés par les 2 participants

## Questions couvertes

- Les 2 participants peuvent-ils apporter des fonds à l’ouverture d’un canal ?

## Réponse courte

Dans un canal à financement partagé, les 2 participants peuvent apporter des fonds à l'ouverture, ce qui répartit la liquidité initiale.

## Explication

- Ils améliorent la distribution initiale de liquidité.
- Ils nécessitent une coordination plus riche à l’ouverture.
- Ils peuvent aider l’onboarding marchand ou wallet.
- Ils réduisent certains besoins de rebalancing initial.

## Limites et confusions

Cela dépend de la compatibilité des implémentations et ne garantit pas une liquidité équilibrée ou suffisante ensuite.

## Approfondissements

- [[lightning-channel.fr|Les canaux Lightning]] pour revenir à la notion de base.
- [[lightning-liquidity.fr|La liquidité d’un canal]] pour revenir à la notion de base.

## Références

- PlanB pro101 — Bitcoin Development Fundamentals
