---
type: "project_note"
id: "bitcoin-mempool-policy"
title: "Règles locales et consensus"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["nodes"]
aliases: ["Bitcoin Mempool Policy"]
parent_ids: []
related_ids: ["bitcoin-mempool", "replace-by-fee", "bitcoin-protocol", "secondary-bitcoin-op-return"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc202 — Setting up your first Bitcoin node"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Règles locales et consensus

## Questions couvertes

- Pourquoi 2 nœuds n’ont-ils pas forcément les mêmes transactions en attente ?

## Réponse courte

La politique de mempool définit ce qu’un nœud accepte, conserve et relaie avant confirmation. Elle se distingue du consensus, qui détermine ce qu’un bloc valide peut contenir.

## Explication

Les nœuds appliquent des conditions de frais, de taille, de remplacement et de formes de transactions. Ces choix protègent leurs ressources et organisent leur participation au relais. Ils peuvent différer entre logiciels, versions et réglages.

Une transaction refusée par la politique d’un nœud peut donc rester valide au regard du consensus et parvenir à un mineur par un autre chemin. Si elle figure ensuite dans un bloc valide, son absence préalable dans cette mempool ne rend pas automatiquement le bloc invalide.

## Limites et confusions

Un filtre local n’interdit pas à tout le réseau de transmettre une transaction. À l’inverse, accepter une transaction dans une mempool ne garantit pas son inclusion future. Les débats sur le relais doivent préciser s’ils visent une préférence de transmission ou une nouvelle règle de validation des blocs.

## Approfondissements

- [[bitcoin-mempool.fr|La file d’attente des transactions]].
- [[replace-by-fee.fr|Augmenter les frais avec RBF]].
- [[bitcoin-protocol.fr|Les règles de Bitcoin]].

- [[secondary-bitcoin-op-return.fr|Les sorties OP_RETURN]].

## Références

- PlanB btc202 — Setting up your first Bitcoin node.
