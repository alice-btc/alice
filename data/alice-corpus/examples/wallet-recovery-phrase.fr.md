---
type: "project_note"
id: "wallet-recovery-phrase"
title: "La phrase de récupération"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["Wallet Recovery Phrase"]
parent_ids: []
related_ids: ["bitcoin-seed", "bip39-passphrase", "wallet-backup", "secondary-lightning-lnd-aezeed"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc102 — Getting your first bitcoins", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La phrase de récupération

## Questions couvertes

- À quoi servent les mots de sauvegarde ?

## Réponse courte

La phrase de récupération est une suite de mots utilisée par de nombreux portefeuilles pour reconstruire leurs clés. Elle doit être traitée comme un secret permettant potentiellement de dépenser les fonds.

## Explication

Le portefeuille transforme cette information en données de départ pour retrouver les clés et les adresses. Cela permet une récupération après la perte ou la panne d’un appareil, sous réserve de compatibilité et des paramètres utilisés.

Une photo, une copie dans un cloud ou une saisie sur un faux site peut exposer ce secret. La protection doit aussi couvrir les accidents matériels, la perte et l’accès futur des personnes autorisées. Une sauvegarde doit rester utilisable, pas seulement cachée.

## Limites et confusions

Tous les portefeuilles n’utilisent pas le même format. Une passphrase éventuelle, les chemins de dérivation et les informations d’une configuration multisig peuvent aussi être nécessaires. Une phrase ne restaure pas forcément toutes les métadonnées ou tous les états d’un protocole complémentaire. Aucun support n’a besoin de la recevoir pour expliquer un problème.

## Approfondissements

- [[bitcoin-seed.fr|De la phrase aux clés]].
- [[bip39-passphrase.fr|La passphrase optionnelle]].
- [[wallet-backup.fr|Préparer une sauvegarde]].

- [[secondary-lightning-lnd-aezeed.fr|Le format de récupération aezeed de LND]].

## Références

- PlanB btc102 — Getting your first bitcoins.
- PlanB Extraction — 2026-05-23.
