---
type: "project_note"
id: "secondary-bitcoin-confidential-transactions"
title: "Les transactions confidentielles"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Confidential Transactions"]
parent_ids: ["liquid-network", "blockchain-privacy-leaks"]
related_ids: ["liquid-network", "blockchain-privacy-leaks"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB sid302 — Liquid Bootcamp Essentials"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les transactions confidentielles

## Questions couvertes

- Comment vérifier des montants sans les rendre publics ?

## Réponse courte

Les transactions confidentielles cachent les montants tout en permettant de vérifier certaines contraintes comptables. Dans Liquid, le type d'actif peut aussi être masqué.

## Explication

- Liquid ajoute aussi le masquage du type d’actif.
- Elles reposent sur des commitments et proofs pour empêcher l’inflation cachée.
- Elles servent surtout la confidentialité commerciale et financière.

## Limites et confusions

Elles ne rendent pas automatiquement anonymes les participants et n'éliminent pas les bugs d'implémentation.

## Approfondissements

- [[liquid-network.fr|Comprendre Liquid]] pour revenir à la notion de base.
- [[blockchain-privacy-leaks.fr|Les informations publiques sur la chaîne]] pour revenir à la notion de base.

## Références

- PlanB sid302 — Liquid Bootcamp Essentials
