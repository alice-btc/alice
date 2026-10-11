---
type: "project_note"
id: "multisig"
title: "La signature multiple"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["Multisig"]
parent_ids: []
related_ids: ["descriptor-wallet", "wallet-backup", "partially-signed-bitcoin-transaction", "secondary-bitcoin-defense-in-depth", "secondary-bitcoin-musig"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB pro202 — Programming Bitcoin"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La signature multiple

## Questions couvertes

- Que signifie une configuration 2 sur 3 ?

## Réponse courte

Une configuration multisig exige plusieurs signatures parmi un ensemble de clés. Dans un schéma 2 sur 3, 2 clés distinctes parmi les 3 prévues doivent autoriser la dépense.

## Explication

Cette organisation peut répartir le contrôle entre appareils, lieux ou personnes. Une seule clé compromise ne suffit alors pas à satisfaire ce seuil, et la perte d’une clé peut rester tolérable si les autres moyens nécessaires sont disponibles.

La sauvegarde doit décrire les conditions exactes, les clés publiques des cosignataires et les chemins ou descripteurs. Conserver uniquement les mots d’un appareil ne reconstitue pas forcément le portefeuille complet.

## Limites et confusions

Le multisig n’est pas automatiquement plus sûr. Placer les clés et leurs sauvegardes au même endroit peut annuler le bénéfice de séparation. Une procédure incomprise complique la récupération et la transmission. Le nombre d’appareils ne prouve pas leur indépendance. Il faut distinguer le seuil de signature de la simple double authentification d’un compte centralisé.

## Approfondissements

- [[descriptor-wallet.fr|Les portefeuilles à descripteurs]].
- [[wallet-backup.fr|Préparer une sauvegarde]].
- [[partially-signed-bitcoin-transaction.fr|Préparer et signer une transaction avec PSBT]].

- [[secondary-bitcoin-defense-in-depth.fr|Combiner plusieurs protections]].
- [[secondary-bitcoin-musig.fr|Les signatures communes avec MuSig]].

## Références

- PlanB pro202 — Programming Bitcoin.
