---
type: "project_note"
id: "secondary-nodes-bitcoin-indexer"
title: "Les indexeurs Bitcoin"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["nodes"]
aliases: ["Bitcoin Indexer"]
parent_ids: ["wallet-node-connection", "bitcoin-core"]
related_ids: ["wallet-node-connection", "bitcoin-core"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB btc202 — Setting up your first Bitcoin node"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les indexeurs Bitcoin

## Questions couvertes

- Pourquoi certains portefeuilles ont-ils besoin d’un indexeur en plus du nœud ?

## Réponse courte

Un indexer Bitcoin construit des index supplémentaires pour retrouver rapidement les transactions, adresses ou scripts pertinents pour un wallet ou une application. Bitcoin Core ne fournit pas par défaut tous les index pratiques pour un wallet externe.

## Explication

- Un indexer facilite la consultation d’historique par adresse ou script.
- Electrs est une solution populaire pour servir des wallets compatibles Electrum.
- Ajouter un indexer augmente stockage, CPU et surface opérationnelle.
- L’indexer peut améliorer l’indépendance si le wallet l’utilise localement.

## Limites et confusions

Les index et ressources nécessaires varient selon les requêtes ; tous les portefeuilles n’en ont pas besoin.

## Approfondissements

- [[wallet-node-connection.fr|Relier un portefeuille à son nœud]] pour revenir à la notion de base.
- [[bitcoin-core.fr|Le logiciel Bitcoin Core]] pour revenir à la notion de base.

## Références

- PlanB btc202 — Setting up your first Bitcoin node
