---
type: "project_note"
id: "secondary-tx-model-transaction-malleability"
title: "La malléabilité des transactions"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["tx-model"]
aliases: ["Transaction Malleability"]
parent_ids: ["segwit-address", "lightning-network"]
related_ids: ["segwit-address", "lightning-network"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pro202 — Programming Bitcoin"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# La malléabilité des transactions

## Questions couvertes

- L’identifiant d’une transaction peut-il changer sans changer son paiement ?

## Réponse courte

La malléabilité de transaction est la possibilité de modifier une transaction sans changer son effet économique mais en changeant son identifiant.

## Explication

- Avec ECDSA legacy, certaines variantes de signature pouvaient rester valides.
- Changer le txid casse les protocoles qui référencent des transactions non confirmées.
- Les règles low-S et SegWit réduisent ou éliminent ces vecteurs majeurs.
- La correction a ouvert la voie à Lightning.

## Limites et confusions

Les garanties dépendent du format de transaction et des entrées ; ne pas promettre suppression de toute malléabilité.

## Approfondissements

- [[segwit-address.fr|Les adresses bc1q]] pour revenir à la notion de base.
- [[lightning-network.fr|Comprendre Lightning]] pour revenir à la notion de base.

## Références

- PlanB pro202 — Programming Bitcoin
