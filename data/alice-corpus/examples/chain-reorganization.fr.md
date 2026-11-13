---
type: "project_note"
id: "chain-reorganization"
title: "Les réorganisations de chaîne (reorg)"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Reorg", "Réorganisation de chaîne", "Chain reorganization", "Bloc orphelin", "Orphan block"]
parent_ids: []
related_ids: ["bitcoin-transaction-confirmation", "bitcoin-finality", "secondary-bitcoin-stale-block"]
reviewed_at: "2026-11-13"
review_due: null
sources: ["https://developer.bitcoin.org/devguide/block_chain.html"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# Les réorganisations de chaîne (reorg)

## Questions couvertes

- Qu'est-ce qu'un reorg ?
- Que se passe-t-il quand un bloc est orphelin ou remplacé par un autre ?
- Une réorganisation peut-elle annuler une transaction déjà confirmée ?
- Pourquoi un explorateur affiche-t-il un bloc abandonné ?

## Réponse courte

Une réorganisation de chaîne, ou reorg, se produit quand des nœuds abandonnent le ou les derniers blocs de leur chaîne active pour suivre une autre branche valide qui porte davantage de travail accumulé.

## Explication

Deux mineurs peuvent trouver presque en même temps 2 blocs valides à la même hauteur. Les nœuds suivent provisoirement celui qu'ils ont reçu en premier, puis se rangent derrière la branche qui accumule le plus de travail quand un bloc suivant arrive. Le bloc écarté devient un bloc valide non retenu, souvent appelé bloc orphelin ou stale. Il n'était ni invalide ni piraté.

Les transactions du bloc écarté ne disparaissent pas toutes : celles que la branche gagnante contient déjà restent confirmées, les autres redeviennent non confirmées et peuvent être incluses dans un bloc suivant. Pendant ce délai, une transaction concurrente qui dépense les mêmes fonds peut être confirmée à sa place.

C'est pourquoi une transaction avec 1 confirmation peut redevenir non confirmée. Chaque bloc ajouté ensuite rend un tel retour en arrière moins probable, ce qui explique l'attente de plusieurs confirmations pour les montants importants.

## Limites et confusions

Un reorg de 1 bloc arrive occasionnellement ; les reorgs profonds sont rares et demandent beaucoup de puissance de calcul. Le nombre de confirmations à attendre est une convention de prudence, pas une règle du protocole. La récompense du mineur dont le bloc est écarté n'est pas conservée.

## Approfondissements

- [[bitcoin-transaction-confirmation.fr|Les confirmations]].
- [[bitcoin-finality.fr|La finalité d’un paiement]].
- [[secondary-bitcoin-stale-block.fr|Les blocs valides non retenus]].

## Références

- https://developer.bitcoin.org/devguide/block_chain.html.
