---
type: "project_note"
id: "block-space"
title: "La place disponible dans les blocs"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Cryptographie et limites du protocole"]
aliases: ["Block Space"]
parent_ids: []
related_ids: ["bitcoin-scalability-problem", "bitcoin-layered-architecture"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://bitcoincore.org/en/2015/12/07/roadmap/", "https://bitcoincore.org/en/2016/10/28/segwit-costs/"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La place disponible dans les blocs

## Questions couvertes

- Pourquoi tout ne peut-il pas être inscrit immédiatement ?

## Réponse courte

L’espace dans les blocs Bitcoin est limité. Lorsque beaucoup de transactions cherchent une confirmation, elles entrent en concurrence et les frais influencent leur priorité d’inclusion.

## Explication

Les nœuds doivent recevoir et vérifier les blocs. Augmenter la capacité peut accroître les ressources nécessaires ; la réduire excessivement peut renchérir l’accès direct à la chaîne. La discussion porte donc sur un compromis entre usages, coûts de validation et autonomie.

Les transactions n’occupent pas toutes le même espace utile. Leur structure et leur taille virtuelle comptent dans le coût payé à un taux de frais donné. Regrouper des paiements ou utiliser des couches comme Lightning peut réduire certaines demandes d’inscription individuelle sur la chaîne.

## Limites et confusions

Un taux de frais élevé n’est pas une garantie de confirmation à une heure exacte. Les mineurs choisissent leurs transactions et le rythme des blocs reste probabiliste.

Une limite de bloc ne mesure pas à elle seule la décentralisation. Les ressources matérielles, les logiciels et les usages comptent aussi. Comparer Bitcoin à un réseau de cartes uniquement par un nombre de transactions ignore les différences entre enregistrement sur la chaîne, règlement et paiements organisés ailleurs.

## Approfondissements

- [[bitcoin-scalability-problem.fr|Les limites de capacité]] — comprendre les limites de capacité
- [[bitcoin-layered-architecture.fr|Les couches de Bitcoin]] — voir les solutions en couches

## Références

- [Gregory Maxwell, feuille de route de 2015](https://bitcoincore.org/en/2015/12/07/roadmap/).
- [Bitcoin Core, coûts et risques de SegWit, 2016](https://bitcoincore.org/en/2016/10/28/segwit-costs/).
