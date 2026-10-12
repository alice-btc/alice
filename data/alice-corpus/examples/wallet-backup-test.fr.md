---
type: "project_note"
id: "wallet-backup-test"
title: "Vérifier sa sauvegarde"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["Wallet Backup Test"]
parent_ids: []
related_ids: ["watch-only-wallet", "wallet-backup", "multisig"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0380.mediawiki"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Vérifier sa sauvegarde

## Questions couvertes

- Comment savoir si ma sauvegarde est exploitable ?

## Réponse courte

Un test de sauvegarde vérifie qu’une récupération fonctionne réellement. Retrouver les bonnes adresses est utile, mais un test complet doit aussi démontrer l’accès aux clés nécessaires pour signer.

## Explication

Un portefeuille en lecture seule peut afficher le solde et l’historique sans détenir aucun secret de dépense. Il valide donc une partie de la restauration, pas sa totalité. Dans une configuration multisig, il faut également retrouver les conditions et les informations de coordination.

Le test doit être adapté au matériel et au logiciel, dans un environnement sûr. Sa documentation décrit ce qui a été vérifié, sans copier les mots ou les secrets dans un rapport. Une procédure écrite et une procédure effectivement vérifiée sont 2 états différents.

## Limites et confusions

Vérifier une sauvegarde ne justifie pas d’exposer une phrase sur un site ou un ordinateur inconnu. Une signature de test ne prouve pas toutes les conditions d’un scénario complexe. Les essais doivent éviter de mettre en jeu des fonds importants. La fiche explique l’objectif de vérification, sans imposer une manipulation universelle à tous les portefeuilles.

## Approfondissements

- [[watch-only-wallet.fr|Observer sans pouvoir dépenser]].
- [[wallet-backup.fr|Préparer une sauvegarde]].
- [[multisig.fr|La signature multiple]].

## Références

- [Référence publique conservée de la note source](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki).
- [Référence publique conservée de la note source](https://github.com/bitcoin/bips/blob/master/bip-0380.mediawiki).
