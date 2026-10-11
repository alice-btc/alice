---
type: "project_note"
id: "bitcoin-transaction-output"
title: "Les sorties d’une transaction"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Bitcoin Transaction Output"]
parent_ids: []
related_ids: ["change-output", "bitcoin-address", "transaction-batching"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB pro202 — Programming Bitcoin"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les sorties d’une transaction

## Questions couvertes

- Pourquoi une transaction a-t-elle plusieurs sorties ?

## Réponse courte

Une sortie attribue un montant à des conditions de dépense. Une transaction peut en créer plusieurs, notamment pour payer un destinataire et rendre la monnaie au payeur.

## Explication

Une sortie contient un montant en satoshis et un script indiquant comment ce montant pourra être dépensé. L’adresse utilisée dans un portefeuille représente généralement ces conditions sous une forme pratique à copier ou scanner. Les sorties dépensables encore disponibles constituent les UTXO.

Une transaction regroupant plusieurs paiements peut créer plusieurs sorties destinataires. À l’inverse, toutes les sorties visibles dans un explorateur ne correspondent pas à des achats distincts. Une partie peut revenir au même portefeuille.

## Limites et confusions

Les frais ne sont pas une sortie supplémentaire du paiement. Ils résultent de la différence entre le total des entrées et celui des sorties, puis sont attribués au mineur dans la transaction coinbase du bloc. L’ordre des sorties ne suffit pas à savoir laquelle est la monnaie rendue. Un observateur peut formuler des hypothèses sans disposer d’une preuve.

## Approfondissements

- [[change-output.fr|La monnaie rendue]].
- [[bitcoin-address.fr|Comprendre une adresse Bitcoin]].
- [[transaction-batching.fr|Regrouper plusieurs paiements]].

## Références

- PlanB pro202 — Programming Bitcoin.
