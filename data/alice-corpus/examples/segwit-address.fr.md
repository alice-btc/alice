---
type: "project_note"
id: "segwit-address"
title: "Les adresses bc1q"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["SegWit Address"]
parent_ids: []
related_ids: ["legacy-address", "taproot", "bitcoin-address-scripts", "secondary-tx-model-transaction-malleability"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture", "PlanB Extraction — 2026-05-24 — Glossary"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les adresses bc1q

## Questions couvertes

- Qu’est-ce qu’une adresse SegWit ?

## Réponse courte

Sur le réseau principal, les adresses qui commencent par bc1q correspondent à SegWit version 0 et utilisent l’encodage Bech32. Elles se distinguent notamment des adresses Taproot qui commencent par bc1p.

## Explication

SegWit sépare certaines données de signature et modifie leur contribution au poids de la transaction. Certaines dépenses deviennent ainsi plus économes en espace et en frais à taux égal. Le format Bech32 fournit aussi une détection d’erreurs de saisie.

Il faut distinguer le format de réception et le portefeuille qui le gère. Restaurer les bonnes clés avec un mauvais type d’adresse ou un mauvais chemin de dérivation peut empêcher un logiciel de retrouver les fonds attendus.

## Limites et confusions

Le préfixe dépend du réseau ; bc concerne le réseau principal. Une adresse bc1q ne garantit ni anonymat ni frais toujours minimaux. Le contrôle d’erreur ne permet pas de corriger au hasard une adresse destinée à un paiement.

## Approfondissements

- [[legacy-address.fr|Comparer les formats d’adresses Bitcoin]].
- [[taproot.fr|Les adresses bc1p et Taproot]].
- [[bitcoin-address-scripts.fr|Adresses, scripts et conditions de dépense]].

- [[secondary-tx-model-transaction-malleability.fr|La malléabilité des transactions]].

## Références

- PlanB cyp201 — Bitcoin Wallet Architecture.
- PlanB Extraction — 2026-05-24 — Glossary.
