---
type: "project_note"
id: "spark-trust-and-exits"
title: "Spark, opérateurs et sorties vers Bitcoin"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin-layers", "custody"]
aliases: ["Spark", "statechains", "Spark operators"]
parent_ids: ["bitcoin-layered-architecture", "self-custody"]
related_ids: ["ark-implementations-bark-arkade", "fedimint-custody-and-privacy", "alice-explorer"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://offchain.media/article/what-is-spark-bitcoin/", "https://docs.spark.money/learn/trust-model", "https://docs.spark.money/learn/withdrawals", "https://docs.spark.money/learn/core-concepts"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# Spark, opérateurs et sorties vers Bitcoin

## Questions couvertes

- Que détient-on lorsqu’on utilise Spark ?
- À quoi servent les opérateurs et peut-on sortir sans eux ?
- Pourquoi avoir une clé ne suffit-il pas à décrire toutes les garanties ?

## Réponse courte

Spark organise des transferts hors chaîne de droits sur des fonds liés à Bitcoin, avec une clé utilisateur et la participation d’opérateurs. Il simplifie certains paiements, mais ses garanties dépendent aussi du protocole de transfert et des données nécessaires à la sortie.

## Explication

Le modèle s’appuie sur des structures de transactions et des mises à jour de clés entre propriétaires successifs. L’utilisateur ne publie pas chaque transfert sur Bitcoin. Les opérateurs participent aux signatures et au changement d’état.

La documentation décrit une hypothèse d’honnêteté au moment du transfert, liée à l’effacement d’anciens secrets par au moins 1 opérateur, ou le seuil exigé par la configuration. La détention d’une clé utilisateur ne supprime pas cette hypothèse.

Une sortie coopérative utilise la participation de l’opérateur. Une sortie unilatérale utilise des transactions pré-signées, des confirmations et des délais. Elle demande les bonnes données et entraîne des frais Bitcoin. L’existence d’un chemin de sortie ne démontre pas que chaque wallet le rend aussi simple à utiliser.

## Limites et confusions

L’article de Marius sur Offchain Media fournit le contexte et une lecture critique. Les mécanismes sont recoupés avec la documentation du projet, consultée le 2026-10-11. Il ne s’agit pas d’un audit indépendant ni d’un essai de récupération.

Un paiement Spark, une facture Lightning payée depuis un service compatible et une transaction Bitcoin sont des opérations différentes. Aucun wallet particulier n’est recommandé ; son support et ses procédures doivent être vérifiés séparément.

## Approfondissements

- [[ark-implementations-bark-arkade.fr|Ark, Bark et Arkade, comprendre les différences]] pour comparer les modèles d’opérateur et de sortie.
- [[fedimint-custody-and-privacy.fr|Fedimint, garde fédérée et confidentialité]] pour distinguer garde fédérée et transfert avec une clé utilisateur.
- [[alice-explorer.fr|Comprendre Explorer]] pour comprendre les limites des données observables.

## Références

- [Marius, Offchain Media, présentation et analyse de Spark, 2 juin 2026](https://offchain.media/article/what-is-spark-bitcoin/).
- [Spark, concepts](https://docs.spark.money/learn/core-concepts).
- [Spark, hypothèses de confiance](https://docs.spark.money/learn/trust-model).
- [Spark, sorties coopératives et unilatérales](https://docs.spark.money/learn/withdrawals).
