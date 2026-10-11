---
type: "project_note"
id: "utxo-set"
title: "L’état des sorties non dépensées"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["nodes"]
aliases: ["UTXO Set"]
parent_ids: []
related_ids: ["bitcoin-utxo", "pruned-node", "initial-block-download"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc202 — Setting up your first Bitcoin node", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# L’état des sorties non dépensées

## Questions couvertes

- Quelles informations permettent de vérifier une nouvelle dépense ?

## Réponse courte

L’ensemble des UTXO regroupe les sorties encore non dépensées suivies par le nœud. Il lui permet de vérifier qu’une nouvelle transaction utilise des fonds disponibles et respecte leurs conditions.

## Explication

À chaque bloc, certaines sorties sont consommées et d’autres sont créées. Le nœud met à jour cet état en fonction des transactions acceptées. Ce registre de disponibilité n’est pas identique à l’archive complète des anciens blocs.

Cette séparation explique qu’un nœud élagué puisse vérifier de nouvelles dépenses après avoir supprimé des données historiques. Elle explique aussi pourquoi la taille de l’état et la rapidité de ses accès influencent les ressources nécessaires.

## Limites et confusions

L’UTXO set ne contient pas simplement une liste de comptes ou de propriétaires. Les conditions de dépense comptent, et certaines sorties apparemment disponibles peuvent être impossibles à utiliser en pratique. Une sortie conservée durablement impose un coût de suivi distinct de celui d’une donnée historique élaguable. Les jugements sur les usages de cet espace doivent être séparés de cette description technique.

## Approfondissements

- [[bitcoin-utxo.fr|Comprendre les UTXO]].
- [[pruned-node.fr|Le nœud élagué]].
- [[initial-block-download.fr|La synchronisation initiale]].

## Références

- PlanB btc202 — Setting up your first Bitcoin node.
- PlanB Extraction — 2026-05-23.
