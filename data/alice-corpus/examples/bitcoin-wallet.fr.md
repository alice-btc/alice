---
type: "project_note"
id: "bitcoin-wallet"
title: "Le rôle d’un portefeuille Bitcoin"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["Bitcoin Wallet"]
parent_ids: []
related_ids: ["self-custody", "custodial-wallet", "wallet-node-connection"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc202 — Setting up your first Bitcoin node", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Le rôle d’un portefeuille Bitcoin

## Questions couvertes

- Que contient réellement un portefeuille ?

## Réponse courte

Un portefeuille Bitcoin gère des clés ou coordonne leur utilisation, prépare des transactions et suit les fonds. Les bitcoins ne sont pas des fichiers stockés dans le téléphone ; leur état est décrit dans le registre.

## Explication

Le portefeuille calcule des adresses et recherche les sorties qui correspondent à ses conditions de dépense. Pour envoyer, il choisit des fonds et organise les signatures. Un appareil séparé peut détenir les clés, tandis que l’interface sur ordinateur sert à préparer et consulter.

Le portefeuille a aussi besoin d’informations sur la chaîne. Il peut les obtenir auprès d’un nœud personnel ou d’un serveur tiers. Gérer ses propres clés et vérifier soi-même les règles sont donc 2 fonctions distinctes.

## Limites et confusions

Une application appelée wallet peut être un service de garde où l’opérateur contrôle les fonds. Un portefeuille en lecture seule peut afficher des soldes sans pouvoir signer. Avant de comparer des produits, il faut identifier qui détient les clés, comment se fait la récupération et d’où proviennent les informations affichées.

## Approfondissements

- [[self-custody.fr|La garde personnelle des clés]].
- [[custodial-wallet.fr|La garde déléguée]].
- [[wallet-node-connection.fr|Relier un portefeuille à son nœud]].

## Références

- PlanB btc202 — Setting up your first Bitcoin node.
- PlanB Extraction — 2026-05-23.
