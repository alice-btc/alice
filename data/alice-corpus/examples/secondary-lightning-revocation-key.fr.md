---
type: "project_note"
id: "secondary-lightning-revocation-key"
title: "Réagir à un état de canal révoqué"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["Revocation Key"]
parent_ids: ["lightning-channel", "watchtower"]
related_ids: ["lightning-channel", "watchtower"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB lnp201 — Lightning Network Theory"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Réagir à un état de canal révoqué

## Questions couvertes

- Réagir à un état de canal révoqué — quel mécanisme et quelles limites ?

## Réponse courte

La revocation key est un mécanisme qui permet de punir la publication d’un ancien état de canal Lightning. Lorsqu’un nouvel état est accepté, l’ancien est révoqué en révélant des données permettant à l’autre partie de récupérer les fonds si cet ancien état est publié.

## Explication

- Elle résout le problème du partenaire qui essaierait de publier un état plus favorable mais obsolète.
- Elle fonctionne avec des timelocks qui laissent le temps de réagir.
- Elle impose aux utilisateurs ou à leurs services de surveiller la chaîne.
- Elle justifie l’existence des watchtowers dans certains modèles.

## Limites et confusions

La possibilité de pénaliser un état révoqué dépend de la détection et de la confirmation de la réponse dans les délais. Elle n’élimine pas les contraintes de surveillance et de frais.

## Approfondissements

- [[lightning-channel.fr|Les canaux Lightning]] pour replacer ce mécanisme dans son contexte.
- [[watchtower.fr|Le rôle d’une watchtower]] pour replacer ce mécanisme dans son contexte.

## Références

- PlanB lnp201 — Lightning Network Theory
