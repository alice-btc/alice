---
type: "project_note"
id: "utxo-labeling"
title: "Étiqueter ses UTXO"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["privacy"]
aliases: ["UTXO Labeling"]
parent_ids: []
related_ids: ["coin-control", "wallet-backup", "non-blockchain-privacy-leaks", "secondary-privacy-kyc-bitcoin-acquisition"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc204 — Privacy on Bitcoin", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Étiqueter ses UTXO

## Questions couvertes

- Pourquoi noter l’origine de ses fonds ?

## Réponse courte

Étiqueter ses UTXO consiste à noter leur origine et leur contexte dans le portefeuille. Cela aide à comprendre quels fonds seront associés lors d’une dépense.

## Explication

Un libellé peut distinguer une réception professionnelle, un remboursement, un don ou de la monnaie rendue. Ces informations ne sont pas toujours déductibles de la transaction publique. Elles rendent le coin control plus compréhensible et peuvent faciliter le suivi de fonds d’origines différentes.

Les étiquettes relèvent des données du portefeuille. Elles peuvent nécessiter une sauvegarde distincte des mots de récupération, qui reconstruisent les clés mais pas nécessairement toutes les annotations.

## Limites et confusions

Les labels peuvent être très sensibles. Leur divulgation peut relier explicitement des identités à des transactions et révéler plus que l’historique public seul. Une bonne étiquette ne rend pas un UTXO techniquement différent et n’efface aucune trace passée. Il faut aussi vérifier comment le logiciel stocke, synchronise ou exporte ces informations.

## Approfondissements

- [[coin-control.fr|Choisir les fonds à dépenser]].
- [[wallet-backup.fr|Préparer une sauvegarde]].
- [[non-blockchain-privacy-leaks.fr|Les fuites hors de la blockchain]].

- [[secondary-privacy-kyc-bitcoin-acquisition.fr|Les traces laissées par un achat avec identification]].

## Références

- PlanB btc204 — Privacy on Bitcoin.
- PlanB Extraction — 2026-05-23.
