---
type: "project_note"
id: "secondary-addresses-hashlock"
title: "Les conditions de dépense par secret"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["addresses"]
aliases: ["Hashlock"]
parent_ids: ["atomic-swap", "bitcoin-script"]
related_ids: ["atomic-swap", "bitcoin-script"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pro202 — Programming Bitcoin"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les conditions de dépense par secret

## Questions couvertes

- À quoi sert un hashlock ?

## Réponse courte

Un hashlock verrouille une dépense à la révélation d’une préimage correspondant à un hash donné.

## Explication

- Le script ne connaît que le hash, pas le secret.
- Le dépensier révèle la préimage pour satisfaire la condition.
- Les hashlocks sont utiles dans plusieurs protocoles off-chain.
- Seuls, ils peuvent être vulnérables au front-running si aucune signature ne lie la dépense.

## Limites et confusions

Le secret seul ne protège pas tous les contrats ; des signatures et délais peuvent être nécessaires.

## Approfondissements

- [[atomic-swap.fr|Les échanges atomiques]] pour revenir à la notion de base.
- [[bitcoin-script.fr|Les conditions de dépense]] pour revenir à la notion de base.

## Références

- PlanB pro202 — Programming Bitcoin
