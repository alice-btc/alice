---
type: "project_note"
id: "secondary-lightning-just-in-time-lightning-channel"
title: "Les canaux ouverts à la demande"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["Just-in-Time Lightning Channel"]
parent_ids: ["lightning-service-provider", "inbound-liquidity"]
related_ids: ["lightning-service-provider", "inbound-liquidity"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB dev303 — Learning Rust with Bitcoin"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les canaux ouverts à la demande

## Questions couvertes

- Les canaux ouverts à la demande — quel mécanisme et quelles limites ?

## Réponse courte

Un service Lightning peut proposer un canal ouvert au moment où un paiement doit être reçu et où la capacité de réception manque. Cette approche just-in-time déplace une partie de la gestion de liquidité vers le service.

## Explication

- L’ouverture répond à un besoin de réception concret.
- Le service peut automatiser des opérations que l’utilisateur aurait autrement préparées.
- Les conditions de frais, de confirmation et de disponibilité doivent être précisées par l’implémentation.

## Limites et confusions

L’ouverture implique des frais et des conditions propres au service. L’acceptation avant confirmation ajoute des hypothèses distinctes ; l’utilisateur doit toujours comprendre le modèle de garde.

## Approfondissements

- [[lightning-service-provider.fr|Les fournisseurs de services Lightning]] pour replacer ce mécanisme dans son contexte.
- [[inbound-liquidity.fr|La capacité de réception]] pour replacer ce mécanisme dans son contexte.

## Références

- PlanB dev303 — Learning Rust with Bitcoin
