---
type: "project_note"
id: "secondary-bitcoin-stale-block"
title: "Les blocs valides non retenus"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Stale Block"]
parent_ids: ["bitcoin-transaction-confirmation", "bitcoin-mining"]
related_ids: ["bitcoin-transaction-confirmation", "bitcoin-mining"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB btc303 — Bitcoin Development Philosophy"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les blocs valides non retenus

## Questions couvertes

- Pourquoi un bloc valide peut-il ne pas rester dans la chaîne active ?

## Réponse courte

Un bloc stale est un bloc valide qui n'appartient finalement pas à la chaîne retenue, par exemple après concurrence entre 2 blocs proches.

## Explication

- Le phénomène augmente lorsque les blocs se propagent ou se valident lentement.
- Les mineurs perdent la récompense des blocs devenus stale.
- La peur du stale peut encourager validationless mining ou centralisation vers des pools mieux connectés.
- Le terme est souvent plus précis que “orphan block” pour Bitcoin moderne.

## Limites et confusions

Les transactions peuvent être reconfirmées ailleurs ; la récompense coinbase du bloc abandonné n'est pas conservée dans la chaîne active.

## Approfondissements

- [[bitcoin-transaction-confirmation.fr|Les confirmations]] pour revenir à la notion de base.
- [[bitcoin-mining.fr|Comprendre le minage]] pour revenir à la notion de base.

## Références

- PlanB btc303 — Bitcoin Development Philosophy
