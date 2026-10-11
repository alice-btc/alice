---
type: "project_note"
id: "bitcoin-chain-analysis"
title: "L’analyse de chaîne"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Bitcoin Chain Analysis"]
parent_ids: []
related_ids: ["common-input-ownership-heuristic", "coinjoin", "kyc-data-leakage", "secondary-bitcoin-dormant-bitcoin-address", "secondary-bitcoin-privacy-by-obfuscation", "secondary-privacy-transaction-heuristics"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc204 — Privacy on Bitcoin", "PlanB Extraction — 2026-05-24 — Glossary"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# L’analyse de chaîne

## Questions couvertes

- Comment des transactions peuvent-elles être reliées ?

## Réponse courte

L’analyse de chaîne exploite les transactions publiques et des données externes pour comprendre des flux et proposer des liens entre acteurs. Ses conclusions de propriété reposent souvent sur des heuristiques.

## Explication

Une heuristique est une règle d’interprétation fréquemment utile, mais qui peut se tromper. Les entrées dépensées ensemble, une sortie ressemblant à de la monnaie rendue ou un schéma de montants peuvent fournir des indices. Une information extérieure, comme l’identification d’un compte, peut renforcer un lien.

Il faut préciser ce qui est observé directement et ce qui est déduit. Les données de transaction sont visibles ; le nom de leur propriétaire ne découle pas automatiquement d’un calcul unique.

## Limites et confusions

Certains liens sont établis par des informations directes, d’autres restent incertains. Il serait donc aussi trompeur de présenter toute attribution comme une certitude que de présenter toutes les données comme inutilisables. Les transactions collaboratives peuvent contredire des hypothèses habituelles. Multiplier des indices dépendants ne donne pas nécessairement plusieurs preuves indépendantes.

## Approfondissements

- [[common-input-ownership-heuristic.fr|L’hypothèse des entrées communes]].
- [[coinjoin.fr|Comprendre CoinJoin]].
- [[kyc-data-leakage.fr|Les données d’identification exposées]].

- [[secondary-bitcoin-dormant-bitcoin-address.fr|Le déplacement de bitcoins longtemps immobiles]].
- [[secondary-bitcoin-privacy-by-obfuscation.fr|La confidentialité par ambiguïté des liens]].
- [[secondary-privacy-transaction-heuristics.fr|Les indices utilisés par l’analyse de chaîne]].

## Références

- PlanB btc204 — Privacy on Bitcoin.
- PlanB Extraction — 2026-05-24 — Glossary.
