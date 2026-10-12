---
type: "project_note"
id: "bitcoin-scalability-problem"
title: "Les limites de capacité"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Cryptographie et limites du protocole"]
aliases: ["Bitcoin Scalability Problem"]
parent_ids: []
related_ids: ["block-space", "bitcoin-layered-architecture"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB pro101 — Bitcoin Development Fundamentals"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les limites de capacité

## Questions couvertes

- Quels compromis implique une augmentation de la capacité de Bitcoin ?

## Réponse courte

La capacité de la chaîne Bitcoin est limitée, tandis qu’un grand nombre d’utilisateurs peuvent vouloir payer. Augmenter cette capacité implique des compromis sur les ressources nécessaires pour vérifier le réseau.

## Explication

Chaque transaction on-chain doit être propagée, conservée selon les besoins du nœud et vérifiée. Des blocs plus volumineux peuvent permettre davantage d’inscriptions, tout en augmentant certains coûts. Préserver une validation accessible fait donc partie du problème.

Les couches de paiement déplacent une partie des échanges hors chaîne. Lightning utilise des canaux ; d’autres systèmes emploient des arbres de transactions, des fédérations ou des intermédiaires. Ils peuvent améliorer l’expérience de paiement, mais ajoutent leurs contraintes de liquidité, de disponibilité, de sauvegarde ou de confiance.

## Limites et confusions

Il n’existe pas un seul chiffre universel de « paiements par seconde » qui résume tous ces usages. Une transaction peut regrouper plusieurs sorties et une opération sur une couche peut correspondre à un règlement différent sur Bitcoin.

Davantage de capacité n’est pas automatiquement davantage d’autonomie. À l’inverse, limiter la chaîne sans alternatives pratiques peut pousser vers la garde centralisée. La comparaison doit expliciter à la fois les gains et les dépendances ajoutées.

## Approfondissements

- [[block-space.fr|La place disponible dans les blocs]] — comprendre la ressource limitée
- [[bitcoin-layered-architecture.fr|Les couches de Bitcoin]] — comparer les différents compromis

## Références

- PlanB pro101 — Bitcoin Development Fundamentals (référence de la note source, non reconsultée directement pour cette adaptation).
