---
type: "project_note"
id: "solo-bitcoin-mining"
title: "Le minage en solo"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Minage et énergie"]
aliases: ["Solo Bitcoin Mining"]
parent_ids: []
related_ids: ["mining-pool", "mining-profitability", "secondary-bitcoin-bitaxe", "secondary-bitcoin-home-bitcoin-mining", "secondary-bitcoin-mining-variance"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://developer.bitcoin.org/devguide/mining.html"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Le minage en solo

## Questions couvertes

- Que signifie miner seul ?

## Réponse courte

En minage solo, le mineur qui trouve le bloc reçoit son revenu au lieu de le partager avec les participants d’un pool classique. Pour une petite machine, les gains sont très rares et irréguliers.

## Explication

La probabilité de trouver un bloc dépend de la part du hashrate détenue. Avec une part fictive et constante de 0,0001 %, la probabilité de trouver le prochain bloc est d’environ 1 sur 1 000 000. Une longue période sans succès n’oblige pas le prochain essai à réussir.

Un service de solo mining peut fournir l’infrastructure technique et prendre des frais, tout en laissant le revenu du bloc au seul mineur gagnant. « Solo » décrit alors la répartition du revenu ; cela ne signifie pas forcément que chaque composant est auto-hébergé.

## Limites et confusions

À puissance identique et hors frais, le solo augmente surtout la variance des revenus par rapport à leur mutualisation. Un succès exceptionnel ne décrit pas une rentabilité typique.

Participer par intérêt technique, pour apprendre ou pour disperser le matériel est un objectif différent de rechercher un revenu régulier. Le coût électrique et le matériel restent à payer même si aucun bloc n’est trouvé.

## Approfondissements

- [[mining-pool.fr|Les pools de minage]] — comparer avec la mutualisation
- [[mining-profitability.fr|Les coûts du minage]] — distinguer espérance de revenu et coûts

- [[secondary-bitcoin-bitaxe.fr|Les mineurs Bitaxe]].
- [[secondary-bitcoin-home-bitcoin-mining.fr|Le minage à domicile]].
- [[secondary-bitcoin-mining-variance.fr|L’irrégularité des résultats du minage]].

## Références

- [Bitcoin Developer Guide, solo et pool mining](https://developer.bitcoin.org/devguide/mining.html).
