---
type: "project_note"
id: "secondary-bitcoin-hash160"
title: "La fonction HASH160"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["HASH160"]
parent_ids: ["bitcoin-address", "cryptographic-hash-function"]
related_ids: ["bitcoin-address", "cryptographic-hash-function"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# La fonction HASH160

## Questions couvertes

- Pourquoi certains formats Bitcoin utilisent-ils une empreinte de 160 bits ?

## Réponse courte

HASH160 applique SHA-256 puis RIPEMD-160 et produit une empreinte de 160 bits, utilisée notamment dans les sorties P2PKH.

## Explication

- La composition applique d’abord SHA-256, puis RIPEMD-160 au résultat.
- Certaines sorties engagent une empreinte de clé publique ; le format d’adresse encode ensuite cette donnée avec des informations de type et de réseau.

## Limites et confusions

Ne pas assimiler cette empreinte à une clé publique ni à tous les formats d'adresses.

## Approfondissements

- [[bitcoin-address.fr|Comprendre une adresse Bitcoin]] pour revenir à la notion de base.
- [[cryptographic-hash-function.fr|L’empreinte cryptographique]] pour revenir à la notion de base.

## Références

- PlanB cyp201 — Bitcoin Wallet Architecture
