---
type: "project_note"
id: "secondary-bitcoin-schnorr-signature"
title: "Les signatures Schnorr"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Schnorr Signature"]
parent_ids: ["taproot", "digital-signature"]
related_ids: ["taproot", "digital-signature"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les signatures Schnorr

## Questions couvertes

- Qu’apportent les signatures Schnorr utilisées par Taproot ?

## Réponse courte

Taproot utilise des signatures Schnorr qui facilitent certaines constructions à plusieurs signataires.

## Explication

- Les propriétés algébriques de Schnorr facilitent des protocoles comme MuSig, où plusieurs signataires participent à une signature commune.
- La confidentialité potentielle vient de la construction complète et de son utilisation, pas uniquement de l’algorithme de signature.

## Limites et confusions

L'agrégation n'est pas automatique pour tous les inputs d'une transaction et nécessite un protocole approprié.

## Approfondissements

- [[taproot.fr|Les adresses bc1p et Taproot]] pour revenir à la notion de base.
- [[digital-signature.fr|La signature numérique]] pour revenir à la notion de base.

## Références

- PlanB cyp201 — Bitcoin Wallet Architecture
