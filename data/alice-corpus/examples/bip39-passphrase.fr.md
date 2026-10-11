---
type: "project_note"
id: "bip39-passphrase"
title: "La passphrase optionnelle"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["BIP39 Passphrase"]
parent_ids: []
related_ids: ["bitcoin-seed", "wallet-backup", "bitcoin-inheritance-plan", "secondary-bitcoin-pbkdf2"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La passphrase optionnelle

## Questions couvertes

- Une passphrase est-elle simplement un mot de passe ?

## Réponse courte

La passphrase BIP39 est un secret optionnel qui modifie la seed dérivée des mots de récupération. Elle ne se limite pas à déverrouiller l’interface comme un mot de passe d’application.

## Explication

Avec la même phrase de récupération, une passphrase différente produit un autre portefeuille. La combinaison exacte doit donc rester récupérable. Une erreur de saisie peut conduire à des adresses différentes plutôt qu’à un message signalant un mauvais mot de passe.

Cette séparation peut limiter les conséquences de la découverte des seuls mots. Elle introduit aussi un risque de perte supplémentaire si le détenteur ou ses proches ne disposent plus de la bonne passphrase.

## Limites et confusions

Ajouter une passphrase n’améliore pas automatiquement la sécurité. Son intérêt dépend de sa qualité, de sa conservation et de la compréhension de son rôle. Elle ne remplace pas une sauvegarde complète ni les paramètres nécessaires à la restauration. La présenter simplement comme un « mot supplémentaire » peut masquer son fonctionnement et ses contraintes de compatibilité.

## Approfondissements

- [[bitcoin-seed.fr|De la phrase aux clés]].
- [[wallet-backup.fr|Préparer une sauvegarde]].
- [[bitcoin-inheritance-plan.fr|Préparer la transmission]].

- [[secondary-bitcoin-pbkdf2.fr|La dérivation BIP39 avec PBKDF2]].

## Références

- PlanB cyp201 — Bitcoin Wallet Architecture.
- PlanB Extraction — 2026-05-23.
