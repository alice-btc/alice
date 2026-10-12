---
type: "project_note"
id: "bitcoin-finality"
title: "La finalité progressive"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Bitcoin Finality"]
parent_ids: []
related_ids: ["bitcoin-transaction-confirmation", "double-spending", "bitcoin-base-layer", "secondary-bitcoin-fee-sniping"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB sur Liquid et Bitcoin", "PlanB sid302 — Liquid Bootcamp Essentials"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La finalité progressive

## Questions couvertes

- Une transaction confirmée est-elle irréversible ?

## Réponse courte

La finalité de Bitcoin est progressive. Plus une transaction accumule de confirmations, plus le risque qu’une réorganisation l’annule devient faible.

## Explication

Des nœuds peuvent recevoir temporairement des blocs concurrents. Ils appliquent les règles de validité et la sélection de chaîne fondée sur le travail accumulé. Un bloc précédemment retenu peut alors être remplacé dans leur historique.

Revenir sur une transaction ancienne exige de remplacer aussi les blocs qui la suivent. Cette accumulation de travail explique pourquoi les confirmations renforcent la confiance dans le règlement. Il faut distinguer ce mécanisme d’un bouton d’annulation à la disposition du payeur ou d’un service client.

## Limites et confusions

Une faible probabilité n’est pas une impossibilité mathématique. La sécurité dépend notamment des ressources d’un attaquant et de l’état du réseau. Une erreur de destinataire ne donne pas au payeur un droit technique de reprise des fonds. Le remboursement éventuel constitue une nouvelle transaction consentie par celui qui les contrôle.

## Approfondissements

- [[bitcoin-transaction-confirmation.fr|Les confirmations]].
- [[double-spending.fr|Le problème de la double dépense]].
- [[bitcoin-base-layer.fr|La couche de base de Bitcoin]].

- [[secondary-bitcoin-fee-sniping.fr|La tentative de récupérer les frais d’un bloc récent]].

## Références

- PlanB sur Liquid et Bitcoin.
- PlanB sid302 — Liquid Bootcamp Essentials.
