---
type: "project_note"
id: "secondary-bitcoin-preimage-resistance"
title: "La résistance à la préimage"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Preimage Resistance"]
parent_ids: ["cryptographic-hash-function"]
related_ids: ["cryptographic-hash-function"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp302 — Modern Cryptography Fundamentals"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# La résistance à la préimage

## Questions couvertes

- Peut-on retrouver une donnée à partir de son empreinte ?

## Réponse courte

La résistance à la préimage rend impraticable la recherche d'une entrée produisant une empreinte donnée.

## Explication

- Elle protège les engagements et certaines constructions de mots de passe.
- Elle dépend de la taille de sortie et de la conception du hash.
- Elle diffère de la résistance aux collisions.
- Bitcoin s’appuie sur cette propriété dans plusieurs contextes.

## Limites et confusions

Un petit ensemble d'entrées prévisibles peut malgré tout être testé ; hacher ne transforme pas un mot de passe faible en secret fort.

## Approfondissements

- [[cryptographic-hash-function.fr|L’empreinte cryptographique]] pour revenir à la notion de base.

## Références

- PlanB cyp302 — Modern Cryptography Fundamentals
