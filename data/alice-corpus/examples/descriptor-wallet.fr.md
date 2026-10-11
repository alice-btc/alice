---
type: "project_note"
id: "descriptor-wallet"
title: "Les portefeuilles à descripteurs"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["Descriptor Wallet"]
parent_ids: []
related_ids: ["wallet-backup", "multisig", "watch-only-wallet"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/bitcoin/bips/blob/master/bip-0380.mediawiki", "https://github.com/bitcoin/bitcoin/blob/v31.1/doc/descriptors.md"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les portefeuilles à descripteurs

## Questions couvertes

- Pourquoi une sauvegarde peut-elle contenir des descripteurs ?

## Réponse courte

Un descripteur décrit explicitement comment retrouver les sorties d’un portefeuille à partir de scripts, de clés et de chemins. Il rend sa configuration plus reproductible entre outils compatibles.

## Explication

Le portefeuille a besoin de savoir quelles conditions de dépense rechercher sur la chaîne. Un descripteur fournit cette description plutôt que de laisser le logiciel deviner le type d’adresse et la dérivation. Il est particulièrement utile pour les configurations multisig et la préparation de transactions.

Un descripteur public peut suffire à suivre les fonds ou à construire des adresses. Les signatures nécessitent toujours l’accès aux clés privées exigées par les conditions de dépense.

## Limites et confusions

Ce sont les transactions qui sont signées, pas les adresses. Un descripteur ne remplace donc pas automatiquement les secrets de sauvegarde. Certains descripteurs peuvent contenir des informations privées ; leur sensibilité dépend du contenu. En multisig, conserver la configuration complète et le nombre de clés nécessaires reste indispensable, même si un logiciel sait déjà afficher le solde.

## Approfondissements

- [[wallet-backup.fr|Préparer une sauvegarde]].
- [[multisig.fr|La signature multiple]].
- [[watch-only-wallet.fr|Observer sans pouvoir dépenser]].

## Références

- [Référence publique conservée de la note source](https://github.com/bitcoin/bips/blob/master/bip-0380.mediawiki).
- [Référence publique conservée de la note source](https://github.com/bitcoin/bitcoin/blob/v31.1/doc/descriptors.md).
