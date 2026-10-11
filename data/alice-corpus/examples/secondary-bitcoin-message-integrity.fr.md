---
type: "project_note"
id: "secondary-bitcoin-message-integrity"
title: "L’intégrité d’un message"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Message Integrity"]
parent_ids: ["cryptographic-hash-function", "software-integrity-verification"]
related_ids: ["cryptographic-hash-function", "software-integrity-verification"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp302 — Modern Cryptography Fundamentals"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# L’intégrité d’un message

## Questions couvertes

- Comment détecter une modification et pourquoi un hash seul ne suffit-il pas toujours ?

## Réponse courte

L'intégrité permet de détecter des modifications d'un message. Un hash doit être obtenu par une voie fiable, ou complété par une signature ou un MAC, pour résister à un remplacement malveillant.

## Explication

- Elle peut être protégée par MAC, signatures ou constructions authentifiées.
- Un hash seul ne suffit pas toujours si l’adversaire peut recalculer le hash.
- Elle est aussi importante que le secret dans des protocoles ouverts.
- Bitcoin dépend de l’intégrité des transactions, blocs et états.

## Limites et confusions

Vérifier le hash publié sur la même source compromise ne prouve pas l'authenticité du fichier.

## Approfondissements

- [[cryptographic-hash-function.fr|L’empreinte cryptographique]] pour revenir à la notion de base.
- [[software-integrity-verification.fr|Vérifier un téléchargement]] pour revenir à la notion de base.

## Références

- PlanB cyp302 — Modern Cryptography Fundamentals
