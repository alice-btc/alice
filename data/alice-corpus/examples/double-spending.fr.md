---
type: "project_note"
id: "double-spending"
title: "Le problème de la double dépense"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["fundamentals"]
aliases: ["Double Spending"]
parent_ids: []
related_ids: ["bitcoin-utxo", "bitcoin-finality", "bitcoin-mempool"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB his201 — The History of Bitcoin's Creation"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Le problème de la double dépense

## Questions couvertes

- Pourquoi un paiement numérique ne peut-il pas être copié ?

## Réponse courte

La double dépense consiste à tenter d’utiliser les mêmes fonds pour 2 paiements incompatibles. Bitcoin empêche de les accepter ensemble dans un même historique valide.

## Explication

Un fichier peut être copié sans priver son propriétaire de l’original. Une monnaie doit au contraire permettre de déterminer quelles unités sont encore dépensables. Bitcoin référence des sorties de transactions précises, les UTXO. Une fois une sortie dépensée, un autre paiement ne peut pas la dépenser à nouveau dans le même historique.

Les nœuds vérifient cette règle. La preuve de travail et les confirmations permettent de départager les historiques concurrents. Une transaction simplement diffusée peut encore être remplacée ou ne jamais être confirmée ; l’avoir vue sur un écran ne suffit pas à la rendre définitive.

## Limites et confusions

La mempool n’est pas un registre définitif partagé. Chaque nœud conserve ses propres transactions en attente. Plus une transaction accumule de confirmations, plus le risque d’annulation par réorganisation devient faible, sans garantie absolue. Une copie du fichier décrivant une transaction ne crée aucun bitcoin supplémentaire.

## Approfondissements

- [[bitcoin-utxo.fr|Comprendre les UTXO]].
- [[bitcoin-finality.fr|La finalité progressive]].
- [[bitcoin-mempool.fr|La file d’attente des transactions]].

## Références

- PlanB his201 — The History of Bitcoin's Creation.
