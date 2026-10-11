---
type: "project_note"
id: "secondary-bitcoin-pseudorandom-number-generator"
title: "Les générateurs pseudo-aléatoires cryptographiques"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Pseudorandom Number Generator"]
parent_ids: ["entropy", "bitcoin-private-key"]
related_ids: ["entropy", "bitcoin-private-key"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp302 — Modern Cryptography Fundamentals"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les générateurs pseudo-aléatoires cryptographiques

## Questions couvertes

- Un générateur pseudo-aléatoire peut-il servir à créer des clés ?

## Réponse courte

Un générateur pseudo-aléatoire cryptographique étend un état secret en valeurs imprévisibles pour l'attaquant. La qualité de son initialisation est essentielle.

## Explication

- Il doit être adapté à un usage cryptographique, pas seulement statistique.
- La graine doit avoir suffisamment d’entropie.
- Des sorties prévisibles peuvent révéler clés ou nonces.
- Il est différent d’un générateur pseudo-aléatoire non sécurisé utilisé pour simulations.

## Limites et confusions

Un générateur statistiquement satisfaisant n'est pas nécessairement adapté aux clés Bitcoin.

## Approfondissements

- [[entropy.fr|L’aléa nécessaire aux clés]] pour revenir à la notion de base.
- [[bitcoin-private-key.fr|La clé privée]] pour revenir à la notion de base.

## Références

- PlanB cyp302 — Modern Cryptography Fundamentals
