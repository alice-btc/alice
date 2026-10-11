---
type: "project_note"
id: "wallet-backup"
title: "Préparer une sauvegarde"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["Wallet Backup"]
parent_ids: []
related_ids: ["wallet-backup-test", "descriptor-wallet", "secure-backups", "secondary-bitcoin-bitcoin-inheritance-support-protocol", "secondary-bitcoin-paper-wallet", "secondary-privacy-backup-3-2-1-method", "secondary-privacy-incident-response-after-infection"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0380.mediawiki", "https://github.com/bitcoin/bitcoin/blob/v31.1/doc/descriptors.md"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Préparer une sauvegarde

## Questions couvertes

- Que faut-il conserver pour restaurer un portefeuille ?

## Réponse courte

Une sauvegarde doit préserver les secrets et les informations nécessaires pour retrouver les fonds et signer une dépense. Son contenu dépend de l’architecture du portefeuille.

## Explication

Pour un portefeuille BIP39, les mots et l’éventuelle passphrase doivent être exacts. Les chemins de dérivation, les types de scripts ou un descripteur peuvent préciser comment retrouver les adresses. En multisig, le seuil et les informations des cosignataires doivent également rester disponibles.

Les métadonnées, telles que les étiquettes de fonds, peuvent mériter une sauvegarde séparée. Les protocoles complémentaires ont parfois des exigences supplémentaires ; une sauvegarde Bitcoin de base ne doit pas être supposée suffisante pour tout outil Lightning ou Liquid.

## Limites et confusions

Une sauvegarde publique en lecture seule peut montrer les fonds sans permettre de signer. La récupération complète doit donc inclure l’accès aux secrets nécessaires. Préserver 1 fichier ne démontre pas qu’il est exploitable ni qu’il contient toutes les informations attendues. Les instructions doivent correspondre au logiciel réellement utilisé et rester compréhensibles après sa perte.

## Approfondissements

- [[wallet-backup-test.fr|Vérifier sa sauvegarde]].
- [[descriptor-wallet.fr|Les portefeuilles à descripteurs]].
- [[secure-backups.fr|Les risques qui menacent une sauvegarde]].

- [[secondary-bitcoin-bitcoin-inheritance-support-protocol.fr|Aider des proches lors d’une succession Bitcoin]].
- [[secondary-bitcoin-paper-wallet.fr|Les anciens portefeuilles papier]].
- [[secondary-privacy-backup-3-2-1-method.fr|La méthode de sauvegarde 3-2-1]].
- [[secondary-privacy-incident-response-after-infection.fr|Réagir à un appareil potentiellement compromis]].

## Références

- [Référence publique conservée de la note source](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki).
- [Référence publique conservée de la note source](https://github.com/bitcoin/bips/blob/master/bip-0380.mediawiki).
- [Référence publique conservée de la note source](https://github.com/bitcoin/bitcoin/blob/v31.1/doc/descriptors.md).
