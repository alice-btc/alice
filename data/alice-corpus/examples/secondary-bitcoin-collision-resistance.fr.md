---
type: "project_note"
id: "secondary-bitcoin-collision-resistance"
title: "La résistance aux collisions"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Collision Resistance"]
parent_ids: ["cryptographic-hash-function", "merkle-tree"]
related_ids: ["cryptographic-hash-function", "merkle-tree"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp302 — Modern Cryptography Fundamentals"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# La résistance aux collisions

## Questions couvertes

- Deux données différentes peuvent-elles avoir la même empreinte ?

## Réponse courte

Résister aux collisions signifie qu'il est impraticable de trouver 2 entrées distinctes produisant la même empreinte.

## Explication

- Une collision menace l’intégrité des engagements.
- La difficulté attendue est liée au birthday bound.
- Elle est cruciale pour structures comme Merkle trees et signatures sur hash.
- Elle est différente de la résistance à la préimage.

## Limites et confusions

Une empreinte de taille finie a forcément des collisions ; la propriété porte sur la difficulté de les trouver.

## Approfondissements

- [[cryptographic-hash-function.fr|L’empreinte cryptographique]] pour revenir à la notion de base.
- [[merkle-tree.fr|Les arbres de Merkle]] pour revenir à la notion de base.

## Références

- PlanB cyp302 — Modern Cryptography Fundamentals
