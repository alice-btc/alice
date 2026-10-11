---
type: "project_note"
id: "common-input-ownership-heuristic"
title: "L’hypothèse des entrées communes"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Common Input Ownership Heuristic"]
parent_ids: []
related_ids: ["coin-control", "coinjoin", "payjoin", "secondary-privacy-transaction-heuristics"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc204 — Privacy on Bitcoin"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# L’hypothèse des entrées communes

## Questions couvertes

- Pourquoi dépenser plusieurs UTXO ensemble peut-il les relier ?

## Réponse courte

L’heuristique des entrées communes suppose que les fonds dépensés ensemble appartiennent au même acteur. Elle est souvent utile pour une transaction ordinaire, mais n’est pas une règle du protocole.

## Explication

Un portefeuille choisit couramment plusieurs UTXO pour financer un paiement. L’observateur en déduit que la même entité avait la capacité de les mobiliser. Une consolidation rend ce rapprochement particulièrement visible puisqu’elle regroupe plusieurs fonds.

Bitcoin permet toutefois de construire une transaction avec plusieurs participants. Ils peuvent chacun autoriser leurs propres entrées. Un CoinJoin ou un PayJoin peut donc réunir des fonds qui n’appartiennent pas au même payeur.

## Limites et confusions

Des signatures valides prouvent le respect des conditions de dépense, pas l’existence d’un propriétaire humain unique. L’heuristique ne doit pas être formulée comme « toutes les entrées appartiennent forcément à la même personne ». La connaissance du contexte et du type de transaction est nécessaire avant une attribution. Les étiquettes conservées par le détenteur peuvent aider à éviter des rapprochements non souhaités.

## Approfondissements

- [[coin-control.fr|Choisir les fonds à dépenser]].
- [[coinjoin.fr|Comprendre CoinJoin]].
- [[payjoin.fr|Comprendre PayJoin]].

- [[secondary-privacy-transaction-heuristics.fr|Les indices utilisés par l’analyse de chaîne]].

## Références

- PlanB btc204 — Privacy on Bitcoin.
