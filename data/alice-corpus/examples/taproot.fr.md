---
type: "project_note"
id: "taproot"
title: "Les adresses bc1p et Taproot"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Taproot"]
parent_ids: []
related_ids: ["legacy-address", "bitcoin-address-scripts", "multisig", "secondary-addresses-mast", "secondary-bitcoin-ecdsa-signature", "secondary-bitcoin-musig", "secondary-bitcoin-schnorr-signature", "secondary-governance-taproot-activation"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les adresses bc1p et Taproot

## Questions couvertes

- Quelle différence entre bc1q et bc1p ?

## Réponse courte

Taproot est une évolution des conditions de dépense de Bitcoin. Sur le réseau principal, ses adresses utilisent Bech32m et commencent par bc1p.

## Explication

Taproot combine les signatures Schnorr et une organisation des conditions de dépense qui peut éviter de révéler toutes les possibilités prévues. Certaines constructions complexes peuvent ainsi apparaître comme une dépense simple lorsque les participants utilisent le chemin adapté.

Pour le débutant, le point important est la compatibilité du portefeuille avec le type d’adresse. Taproot ne remplace pas le contrôle du destinataire ni la sauvegarde des clés. Il s’agit d’une manière de verrouiller et de dépenser des sorties, pas d’un réseau Bitcoin séparé.

## Limites et confusions

Les avantages de confidentialité et de coût dépendent de la construction utilisée. Une adresse bc1p n’est pas anonyme et ne cache pas les montants on-chain. Taproot correspond à SegWit version 1 ; bc1q désigne la version 0. Les mécanismes de scripts et d’agrégation demandent un approfondissement plutôt qu’une promesse générale de transactions invisibles.

## Approfondissements

- [[legacy-address.fr|Comparer les formats d’adresses Bitcoin]].
- [[bitcoin-address-scripts.fr|Adresses, scripts et conditions de dépense]].
- [[multisig.fr|La signature multiple]].

- [[secondary-addresses-mast.fr|Les arbres de conditions de dépense]].
- [[secondary-bitcoin-ecdsa-signature.fr|Les signatures ECDSA dans Bitcoin]].
- [[secondary-bitcoin-musig.fr|Les signatures communes avec MuSig]].
- [[secondary-bitcoin-schnorr-signature.fr|Les signatures Schnorr]].
- [[secondary-governance-taproot-activation.fr|L’activation de Taproot en 2021]].

## Références

- PlanB cyp201 — Bitcoin Wallet Architecture.
- PlanB Extraction — 2026-05-23.
