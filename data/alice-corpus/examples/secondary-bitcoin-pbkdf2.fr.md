---
type: "project_note"
id: "secondary-bitcoin-pbkdf2"
title: "La dérivation BIP39 avec PBKDF2"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["PBKDF2"]
parent_ids: ["bitcoin-seed", "bip39-passphrase"]
related_ids: ["bitcoin-seed", "bip39-passphrase"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# La dérivation BIP39 avec PBKDF2

## Questions couvertes

- Comment les mots de récupération et la passphrase produisent-ils une seed ?

## Réponse courte

BIP39 utilise PBKDF2-HMAC-SHA512 pour dériver une seed à partir de la phrase mnémonique et d'une passphrase optionnelle.

## Explication

- La phrase de récupération et la passphrase éventuelle servent d’entrées à une dérivation déterministe.
- Une passphrase différente produit une autre seed ; le mécanisme ne sait pas distinguer une faute de frappe d’un choix volontaire.

## Limites et confusions

Les itérations ne rendent pas une passphrase faible résistante à toute attaque ; PBKDF2 a aussi d'autres usages.

## Approfondissements

- [[bitcoin-seed.fr|De la phrase aux clés]] pour revenir à la notion de base.
- [[bip39-passphrase.fr|La passphrase optionnelle]] pour revenir à la notion de base.

## Références

- PlanB cyp201 — Bitcoin Wallet Architecture
