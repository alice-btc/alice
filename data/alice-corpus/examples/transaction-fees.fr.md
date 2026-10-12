---
type: "project_note"
id: "transaction-fees"
title: "Les frais de transaction"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Transaction Fees"]
parent_ids: []
related_ids: ["block-weight", "bitcoin-mempool", "replace-by-fee"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB min101 — Introduction to Bitcoin mining", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les frais de transaction

## Questions couvertes

- À quoi servent les frais Bitcoin ?

## Réponse courte

Les frais rémunèrent le mineur qui inclut la transaction dans un bloc. Leur montant est la différence entre la valeur totale des entrées et celle des sorties.

## Explication

Le portefeuille propose généralement un taux en sats par octet virtuel, ou sat/vB. Le coût total dépend de ce taux et de la taille virtuelle de la transaction. Exemple fictif, une transaction de 200 vB à 5 sat/vB paie 1 000 sats.

La demande pour l’espace limité des blocs influence les taux permettant une confirmation rapide. Une transaction avec de nombreuses entrées peut coûter davantage qu’un paiement de valeur supérieure mais plus simple. Les mineurs arbitrent aussi entre transactions dépendantes les unes des autres.

## Limites et confusions

Un taux estimé ne garantit pas une heure de confirmation. Frais totaux et taux de frais sont 2 indicateurs différents. Les frais de retrait facturés par une plateforme ne correspondent pas nécessairement aux frais qu’elle verse au mineur. Aucun pourcentage fixe du montant envoyé ne définit les frais Bitcoin.

## Approfondissements

- [[block-weight.fr|La taille virtuelle et le poids]].
- [[bitcoin-mempool.fr|La file d’attente des transactions]].
- [[replace-by-fee.fr|Augmenter les frais avec RBF]].

## Références

- PlanB min101 — Introduction to Bitcoin mining.
- PlanB Extraction — 2026-05-23.
