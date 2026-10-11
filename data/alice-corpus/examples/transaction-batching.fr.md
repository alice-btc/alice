---
type: "project_note"
id: "transaction-batching"
title: "Regrouper plusieurs paiements"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Transaction Batching"]
parent_ids: []
related_ids: ["bitcoin-transaction-output", "transaction-fees", "consolidation-transaction"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc303 — Bitcoin Development Philosophy", "PlanB Extraction — 2026-05-23 — lnp404"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Regrouper plusieurs paiements

## Questions couvertes

- Pourquoi envoyer à plusieurs personnes dans 1 transaction ?

## Réponse courte

Le batching regroupe plusieurs paiements dans une même transaction. Il permet de partager certaines données communes et de réduire l’espace et les frais par paiement.

## Explication

Une transaction peut créer plusieurs sorties pour différents destinataires. Une entreprise qui effectue de nombreux règlements peut ainsi préparer un lot plutôt qu’une transaction indépendante pour chaque bénéficiaire. Les destinataires obtiennent des sorties distinctes dans une même transaction.

Le gain dépend de la structure des entrées et des sorties ainsi que du taux de frais. Il ne supprime pas la concurrence pour l’espace des blocs ; il utilise cet espace plus efficacement. Tous les paiements du lot partagent son inclusion dans un bloc.

## Limites et confusions

Regrouper peut révéler que plusieurs destinataires ont été payés ensemble. Cela ne prouve pas qu’ils appartiennent à la même personne. Le batching diffère d’une consolidation, qui réunit des fonds du payeur, et d’une transaction collaborative comme CoinJoin. Les économies potentielles ne doivent pas faire oublier le contrôle individuel des montants et des destinations.

## Approfondissements

- [[bitcoin-transaction-output.fr|Les sorties d’une transaction]].
- [[transaction-fees.fr|Les frais de transaction]].
- [[consolidation-transaction.fr|La consolidation des UTXO]].

## Références

- PlanB btc303 — Bitcoin Development Philosophy.
- PlanB Extraction — 2026-05-23 — lnp404.
