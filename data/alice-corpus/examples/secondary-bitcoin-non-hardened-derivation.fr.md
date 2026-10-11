---
type: "project_note"
id: "secondary-bitcoin-non-hardened-derivation"
title: "La dérivation publique des clés enfants"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Non-Hardened Derivation"]
parent_ids: ["extended-public-key", "watch-only-wallet"]
related_ids: ["extended-public-key", "watch-only-wallet"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# La dérivation publique des clés enfants

## Questions couvertes

- Comment un xpub peut-il générer des adresses sans connaître les clés privées ?

## Réponse courte

La dérivation non hardened permet de calculer des clés publiques enfants depuis une clé publique étendue sans disposer de la clé privée parent.

## Explication

- Une clé publique étendue permet de préparer des adresses sans transférer les clés privées au système de réception.
- Cette commodité a des limites de confidentialité et de compartimentation qu’il faut connaître avant de partager un xpub.

## Limites et confusions

La combinaison d'un xpub parent et d'une clé privée enfant non hardened peut compromettre le parent ; conserver la séparation des secrets.

## Approfondissements

- [[extended-public-key.fr|La clé publique étendue]] pour revenir à la notion de base.
- [[watch-only-wallet.fr|Observer sans pouvoir dépenser]] pour revenir à la notion de base.

## Références

- PlanB cyp201 — Bitcoin Wallet Architecture
