---
type: "project_note"
id: "bitcoin-transaction-input"
title: "Les entrées d’une transaction"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Bitcoin Transaction Input"]
parent_ids: []
related_ids: ["bitcoin-utxo", "bitcoin-transaction-output", "coin-selection-tradeoffs", "secondary-bitcoin-coinbase-transaction"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB pro202 — Programming Bitcoin"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les entrées d’une transaction

## Questions couvertes

- D’où viennent les bitcoins dépensés ?

## Réponse courte

Une entrée désigne une sortie de transaction antérieure que l’on veut dépenser. Bitcoin dépense ainsi des morceaux précis de valeur plutôt que de débiter directement un compte global.

## Explication

Chaque entrée identifie la transaction précédente et la position de la sortie concernée. La transaction fournit aussi les données nécessaires pour respecter les conditions de dépense, souvent des signatures. Plusieurs entrées peuvent être réunies pour atteindre le montant souhaité.

Si une entrée vaut 20 000 sats, elle est consommée entièrement. Le paiement, la monnaie rendue éventuelle et les frais expliquent ensuite comment cette valeur est répartie. Le portefeuille effectue généralement cette construction sans demander à l’utilisateur de sélectionner chaque entrée.

## Limites et confusions

Ajouter des entrées augmente habituellement le poids et les frais à taux identique. Cela peut aussi révéler des liens entre fonds. La transaction coinbase qui rémunère le mineur est une exception au modèle de dépense d’anciennes sorties. Le détail technique des données de signature dépend du type de sortie dépensée.

## Approfondissements

- [[bitcoin-utxo.fr|Comprendre les UTXO]].
- [[bitcoin-transaction-output.fr|Les sorties d’une transaction]].
- [[coin-selection-tradeoffs.fr|Sélection des UTXO et compromis]].

- [[secondary-bitcoin-coinbase-transaction.fr|La transaction coinbase]].

## Références

- PlanB pro202 — Programming Bitcoin.
