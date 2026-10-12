---
type: "project_note"
id: "secondary-bitcoin-confidential-address"
title: "Les adresses confidentielles de Liquid"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Confidential Address"]
parent_ids: ["liquid-network", "bitcoin-address"]
related_ids: ["liquid-network", "bitcoin-address"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB sid202 — Building with Elements and Liquid Network"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les adresses confidentielles de Liquid

## Questions couvertes

- À quoi sert une adresse confidentielle sur Liquid ?

## Réponse courte

Une adresse confidentielle Liquid inclut des informations de masquage permettant à l'expéditeur de dissimuler les montants au public.

## Explication

- L’expéditeur a besoin d’informations cryptographiques supplémentaires pour construire un montant masqué que le destinataire pourra interpréter.
- Cette information de réception doit être distinguée des clés autorisant la dépense.

## Limites et confusions

Une adresse confidentielle ne garantit pas à elle seule l'anonymat des parties.

## Approfondissements

- [[liquid-network.fr|Comprendre Liquid]] pour revenir à la notion de base.
- [[bitcoin-address.fr|Comprendre une adresse Bitcoin]] pour revenir à la notion de base.

## Références

- PlanB sid202 — Building with Elements and Liquid Network
