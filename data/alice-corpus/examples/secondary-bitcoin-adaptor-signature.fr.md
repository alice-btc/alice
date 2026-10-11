---
type: "project_note"
id: "secondary-bitcoin-adaptor-signature"
title: "Les signatures adaptatrices"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Adaptor Signature"]
parent_ids: ["atomic-swap", "digital-signature"]
related_ids: ["atomic-swap", "digital-signature"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["Synthèse du vault — Adaptor Signature ; référence externe non précisée dans la note source."]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les signatures adaptatrices

## Questions couvertes

- Comment une signature peut-elle être liée à la révélation d’un secret ?

## Réponse courte

Une signature adaptatrice lie la finalisation d'une signature à un secret, utilisé notamment dans certaines constructions d'échange atomique.

## Explication

- Une partie prépare une donnée de signature liée à un secret ; la signature finalisée et les données préparées peuvent permettre d’extraire ce secret.
- Ce lien peut coordonner des règlements entre participants, mais ne supprime ni les délais ni les risques du protocole complet.

## Limites et confusions

L'extraction du secret requiert les données adaptées de la construction, pas n'importe quelle signature publique.

## Approfondissements

- [[atomic-swap.fr|Les échanges atomiques]] pour revenir à la notion de base.
- [[digital-signature.fr|La signature numérique]] pour revenir à la notion de base.

## Références

- Synthèse du vault — Adaptor Signature ; référence externe non précisée dans la note source.
