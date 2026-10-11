---
type: "project_note"
id: "mining-difficulty-details"
title: "L’ajustement de difficulté en détail"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["mining"]
aliases: ["retarget", "cible de difficulté"]
parent_ids: ["bitcoin-mining"]
related_ids: []
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://developer.bitcoin.org/devguide/block_chain.html", "https://github.com/bitcoin/bitcoin/blob/v28.0/src/pow.cpp"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# L’ajustement de difficulté en détail

## Questions couvertes

- Pourquoi le réseau ne retrouve-t-il pas immédiatement sa cadence après une baisse de hashrate ?

## Réponse courte

Sur Bitcoin mainnet, la cible de preuve de travail est réajustée à chaque période de 2 016 blocs. L’objectif de cadence est d’environ 10 minutes par bloc.

## Explication

Si la puissance de calcul baisse entre 2 ajustements, trouver les blocs peut prendre davantage de temps. Le prochain ajustement répond au temps observé pour la période selon les règles du protocole. Une cible plus élevée facilite la recherche d’une preuve ; une cible plus basse la rend plus difficile.

Sur mainnet, 1 ajustement ne peut pas diviser la difficulté par plus de 4 (baisse maximale de 75 %, soit −75 %), ni la multiplier par plus de 4 (hausse maximale de 300 %, soit +300 %). Après une variation très importante de la puissance de calcul, plusieurs ajustements peuvent donc être nécessaires pour retrouver la cadence moyenne visée, si la puissance de calcul se stabilise.

L’ajustement intervient tous les 2 016 blocs, mais la durée observée est calculée entre les horodatages du premier et du dernier bloc de cette période. Cela représente 2 015 intervalles entre blocs. Cette durée est comparée à la durée cible de 2 016 × 10 minutes, soit 14 jours. Cette particularité du calcul explique pourquoi une formule simplifiée peut différer de l’implémentation.

## Limites et confusions

La cadence est statistique, pas un rendez-vous toutes les 10 minutes. Les réseaux de test peuvent appliquer d’autres paramètres. Cette fiche ne donne pas une formule d’implémentation exacte ni une prédiction de rentabilité.

## Approfondissements

- [[bitcoin-mining.fr|Comprendre le minage]] (bitcoin-mining) pour revenir au rôle du minage.

## Références

- [Bitcoin Developer Guide, chaîne et difficulté](https://developer.bitcoin.org/devguide/block_chain.html).
- [Bitcoin Core 28.0, calcul de la prochaine cible dans `pow.cpp`](https://github.com/bitcoin/bitcoin/blob/v28.0/src/pow.cpp).
