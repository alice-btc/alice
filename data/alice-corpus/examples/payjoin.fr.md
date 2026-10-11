---
type: "project_note"
id: "payjoin"
title: "Comprendre PayJoin"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["privacy"]
aliases: ["PayJoin"]
parent_ids: []
related_ids: ["common-input-ownership-heuristic", "coinjoin", "bitcoin-chain-analysis"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc204 — Privacy on Bitcoin", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Comprendre PayJoin

## Questions couvertes

- Comment un PayJoin modifie-t-il la lecture d’un paiement ?

## Réponse courte

Un PayJoin est un paiement collaboratif dans lequel le destinataire apporte aussi une entrée. Il contredit ainsi l’hypothèse simple selon laquelle toutes les entrées appartiennent au payeur.

## Explication

Les participants préparent une transaction commune qui conserve l’objectif du paiement tout en combinant leurs apports. Pour un observateur extérieur, cette transaction peut ressembler à un paiement ordinaire plutôt qu’à une opération explicitement dédiée à la confidentialité.

Cette organisation dépend de la compatibilité des outils et du mécanisme de coordination. Elle peut aussi modifier la gestion des UTXO du destinataire, puisque celui-ci participe avec ses propres fonds.

## Limites et confusions

Les montants et la transaction restent publics. Le bénéfice porte sur l’interprétation des relations, pas sur leur disparition complète. Le payeur et le destinataire connaissent des informations liées à leur propre échange ; les autres canaux de données comptent toujours. Toutes les transactions à plusieurs entrées ne sont pas des PayJoin, et tout portefeuille ne les prend pas en charge.

## Approfondissements

- [[common-input-ownership-heuristic.fr|L’hypothèse des entrées communes]].
- [[coinjoin.fr|Comprendre CoinJoin]].
- [[bitcoin-chain-analysis.fr|L’analyse de chaîne]].

## Références

- PlanB btc204 — Privacy on Bitcoin.
- PlanB Extraction — 2026-05-23.
