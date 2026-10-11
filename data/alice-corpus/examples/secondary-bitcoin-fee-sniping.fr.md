---
type: "project_note"
id: "secondary-bitcoin-fee-sniping"
title: "La tentative de récupérer les frais d’un bloc récent"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Fee Sniping"]
parent_ids: ["block-reward", "bitcoin-finality"]
related_ids: ["block-reward", "bitcoin-finality"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB btc303 — Bitcoin Development Philosophy"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# La tentative de récupérer les frais d’un bloc récent

## Questions couvertes

- Qu’appelle-t-on fee sniping ?

## Réponse courte

Un mineur peut envisager de reconstruire un bloc récent particulièrement rémunérateur pour tenter d'en récupérer les frais.

## Explication

- Le mineur compare le revenu attendu d’une tentative de remplacement à celui d’un nouveau bloc sur la pointe courante.
- Un fort écart de frais entre blocs peut modifier ses incitations, mais le risque d’échec de la tentative reste déterminant.

## Limites et confusions

L'intérêt dépend des probabilités de réussite et du revenu abandonné ; ce n'est pas un comportement inévitable.

## Approfondissements

- [[block-reward.fr|La rémunération d’un bloc]] pour revenir à la notion de base.
- [[bitcoin-finality.fr|La finalité progressive]] pour revenir à la notion de base.

## Références

- PlanB btc303 — Bitcoin Development Philosophy
