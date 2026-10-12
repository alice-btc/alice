---
type: "project_note"
id: "secondary-bitcoin-op-return"
title: "Les sorties OP_RETURN"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["OP_RETURN"]
parent_ids: ["bitcoin-mempool-policy", "bitcoin-script"]
related_ids: ["bitcoin-mempool-policy", "bitcoin-script"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB csv402 — RGB programming", "Article ou ressource du vault — Bitcoin Spam - Why We Can't Stop It"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les sorties OP_RETURN

## Questions couvertes

- Pourquoi certaines données Bitcoin ne créent-elles pas d’UTXO dépensable ?

## Réponse courte

Une sortie OP_RETURN est non dépensable et peut porter des données ou engagements. Les règles de relais sont distinctes des règles de consensus.

## Explication

- Les sorties explicitement non dépensables peuvent être écartées de l’ensemble des sorties dépensables tout en restant inscrites dans le bloc.
- Accepter de relayer une transaction et accepter un bloc contenant cette transaction sont des décisions régies par des ensembles de règles différents.

## Limites et confusions

La place occupée dans un bloc demeure un coût même sans ajout durable à l'ensemble des UTXO dépensables.

## Approfondissements

- [[bitcoin-mempool-policy.fr|Règles locales et consensus]] pour revenir à la notion de base.
- [[bitcoin-script.fr|Les conditions de dépense]] pour revenir à la notion de base.

## Références

- PlanB csv402 — RGB programming
- Article ou ressource du vault — Bitcoin Spam - Why We Can't Stop It
