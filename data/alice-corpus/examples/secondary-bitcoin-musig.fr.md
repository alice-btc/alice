---
type: "project_note"
id: "secondary-bitcoin-musig"
title: "Les signatures communes avec MuSig"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["MuSig"]
parent_ids: ["multisig", "taproot"]
related_ids: ["multisig", "taproot"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pro101 — Bitcoin Development Fundamentals"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les signatures communes avec MuSig

## Questions couvertes

- Comment plusieurs personnes peuvent-elles produire une seule signature Schnorr ?

## Réponse courte

MuSig désigne des protocoles permettant à plusieurs détenteurs de clés de produire une signature Schnorr commune.

## Explication

- Plusieurs participants coopèrent avec leurs clés pour produire une signature commune vérifiable comme une signature Schnorr.
- La coordination et la gestion sûre des nonces font partie du protocole ; l’agrégation n’est pas un simple collage de signatures indépendantes.

## Limites et confusions

Ne pas confondre automatiquement multisignature agrégée et n'importe quel seuil m-sur-n.

## Approfondissements

- [[multisig.fr|La signature multiple]] pour revenir à la notion de base.
- [[taproot.fr|Les adresses bc1p et Taproot]] pour revenir à la notion de base.

## Références

- PlanB pro101 — Bitcoin Development Fundamentals
