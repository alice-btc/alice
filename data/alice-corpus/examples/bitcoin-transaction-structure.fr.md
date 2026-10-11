---
type: "project_note"
id: "bitcoin-transaction-structure"
title: "Lire une transaction dans un explorateur"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Bitcoin Transaction Structure"]
parent_ids: []
related_ids: ["bitcoin-transaction-input", "bitcoin-transaction-output", "bitcoin-chain-analysis", "secondary-bitcoin-utxo-vs-account-based-model"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc204 — Privacy on Bitcoin", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Lire une transaction dans un explorateur

## Questions couvertes

- Comment reconnaître les informations d’une transaction ?

## Réponse courte

Un explorateur montre les entrées, les sorties et l’état de confirmation d’une transaction. Ces données décrivent des mouvements de sorties monétaires, pas directement l’identité ni l’intention des personnes.

## Explication

Les entrées référencent des fonds antérieurs. Les sorties définissent les montants et les nouvelles conditions de dépense. La différence entre les 2 totaux constitue les frais. Une sortie peut être le paiement, une autre la monnaie rendue, mais leur ordre ne le démontre pas.

Le nombre de confirmations indique la place du paiement dans la chaîne connue de l’explorateur. Pour une transaction non confirmée, l’outil dépend de sa propre connaissance de la mempool.

## Limites et confusions

Additionner toutes les sorties ne donne pas nécessairement le montant d’un achat. Une transaction peut regrouper plusieurs paiements, consolider des fonds ou associer plusieurs participants. Les étiquettes d’un explorateur et les interprétations de monnaie rendue restent des informations à évaluer. Consulter une adresse auprès d’un service externe peut aussi lui révéler un intérêt pour cette adresse.

## Approfondissements

- [[bitcoin-transaction-input.fr|Les entrées d’une transaction]].
- [[bitcoin-transaction-output.fr|Les sorties d’une transaction]].
- [[bitcoin-chain-analysis.fr|L’analyse de chaîne]].

- [[secondary-bitcoin-utxo-vs-account-based-model.fr|Les UTXO comparés aux comptes]].

## Références

- PlanB btc204 — Privacy on Bitcoin.
- PlanB Extraction — 2026-05-23.
