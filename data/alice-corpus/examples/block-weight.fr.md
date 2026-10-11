---
type: "project_note"
id: "block-weight"
title: "La taille virtuelle et le poids"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Block Weight"]
parent_ids: []
related_ids: ["transaction-fees", "segwit-address", "transaction-batching"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB pro202 — Programming Bitcoin"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La taille virtuelle et le poids

## Questions couvertes

- Pourquoi les frais dépendent-ils de la taille de la transaction ?

## Réponse courte

La taille virtuelle mesure l’espace économique occupé par une transaction selon le système de poids de Bitcoin. Elle permet de comparer les taux de frais entre transactions de structures différentes.

## Explication

SegWit distingue certaines données de signature, appelées données de témoin, des autres données. Elles ne contribuent pas de la même manière au poids. Le bloc est limité à 4 000 000 unités de poids.

Pour un utilisateur, l’enjeu est pratique. Ajouter des entrées, des sorties ou certaines conditions de dépense modifie la taille de la transaction. À taux de frais identique, une transaction plus grande coûte davantage. Le montant monétaire envoyé n’est donc pas un bon indicateur de cette taille.

## Limites et confusions

Un bloc de Bitcoin ne se résume pas à un nombre fixe de paiements. Une transaction peut regrouper plusieurs destinataires, et toutes les transactions n’ont pas le même poids. Les formats d’adresse influencent le coût de certaines dépenses, sans garantir à eux seuls le paiement le moins cher dans chaque situation.

## Approfondissements

- [[transaction-fees.fr|Les frais de transaction]].
- [[segwit-address.fr|Les adresses bc1q]].
- [[transaction-batching.fr|Regrouper plusieurs paiements]].

## Références

- PlanB pro202 — Programming Bitcoin.
