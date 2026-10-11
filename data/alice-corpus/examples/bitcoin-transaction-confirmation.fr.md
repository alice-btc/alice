---
type: "project_note"
id: "bitcoin-transaction-confirmation"
title: "Les confirmations"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Bitcoin Transaction Confirmation"]
parent_ids: []
related_ids: ["bitcoin-finality", "bitcoin-mempool", "proof-of-work", "secondary-bitcoin-coinbase-maturity", "secondary-bitcoin-stale-block"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB min101 — Introduction to Bitcoin mining"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les confirmations

## Questions couvertes

- Que signifie 1 confirmation ?

## Réponse courte

1 confirmation signifie qu’une transaction figure dans un bloc de la chaîne retenue. Chaque bloc ajouté après celui-ci lui apporte une confirmation supplémentaire.

## Explication

Avant son inclusion, une transaction peut être connue des nœuds tout en restant non confirmée. Une fois incluse, elle participe à l’historique vérifié. Les blocs suivants ajoutent du travail au-dessus d’elle et rendent un remplacement de cet historique plus difficile.

Les interfaces affichent souvent ce nombre pour aider à distinguer un paiement en attente d’un paiement plus solidement inscrit. Le délai entre 2 confirmations varie, car la découverte des blocs est irrégulière. Une moyenne ne constitue pas une échéance.

## Limites et confusions

Le nombre de confirmations attendu dépend du contexte et du risque accepté. Il n’existe pas une règle universelle garantissant tout paiement après un nombre magique de blocs. Une transaction confirmée peut perdre des confirmations lors d’une réorganisation. Plus elle en accumule, plus ce risque devient faible dans les conditions normales de fonctionnement du réseau.

## Approfondissements

- [[bitcoin-finality.fr|La finalité progressive]].
- [[bitcoin-mempool.fr|La file d’attente des transactions]].
- [[proof-of-work.fr|La preuve de travail]].

- [[secondary-bitcoin-coinbase-maturity.fr|La maturité des récompenses de bloc]].
- [[secondary-bitcoin-stale-block.fr|Les blocs valides non retenus]].

## Références

- PlanB min101 — Introduction to Bitcoin mining.
