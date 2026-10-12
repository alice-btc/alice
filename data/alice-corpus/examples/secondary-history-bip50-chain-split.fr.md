---
type: "project_note"
id: "secondary-history-bip50-chain-split"
title: "La scission accidentelle de mars 2013"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["history"]
aliases: ["BIP50 Chain Split"]
parent_ids: ["bitcoin-consensus", "bitcoin-governance"]
related_ids: ["bitcoin-consensus", "bitcoin-governance"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB btc303 — Bitcoin Development Philosophy"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# La scission accidentelle de mars 2013

## Questions couvertes

- Pourquoi des nœuds Bitcoin ont-ils divergé en mars 2013 ?

## Réponse courte

BIP50 documente le split de mars 2013 entre Bitcoin 0.7 et 0.8, causé par une limite implicite de verrous Berkeley DB devenue règle de consensus accidentelle.

## Explication

- Un bloc contenant beaucoup d’inputs a été accepté par 0.8 et rejeté par certains nœuds pré-0.8.
- Des pools importants ont downgradé pour ramener le hashrate sur la branche compatible 0.7.
- La résolution a combiné action minière rapide et patchs temporaires.
- L’incident montre qu’une contrainte d’implémentation peut devenir règle de consensus involontaire.

## Limites et confusions

L’incident historique ne permet pas de déduire qu’une coordination similaire serait simple ou garantie aujourd’hui.

## Approfondissements

- [[bitcoin-consensus.fr|Le consensus]] pour revenir à la notion de base.
- [[bitcoin-governance.fr|L’évolution des règles]] pour revenir à la notion de base.

## Références

- PlanB btc303 — Bitcoin Development Philosophy
