---
type: "project_note"
id: "secondary-bitcoin-blind-signatures"
title: "Les signatures aveugles"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Blind Signatures"]
parent_ids: ["cashu-et-confiance-dans-le-mint", "coinjoin"]
related_ids: ["cashu-et-confiance-dans-le-mint", "coinjoin"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB his201 — The History of Bitcoin's Creation"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les signatures aveugles

## Questions couvertes

- Comment un émetteur peut-il signer un jeton sans en voir le contenu ?

## Réponse courte

Une signature aveugle permet de signer un message sans en voir le contenu. Elle aide un mint ecash à valider des jetons sans relier directement leur émission à leur dépense.

## Explication

- Elles séparent autorisation et traçabilité directe.
- Elles sont centrales dans le modèle eCash chaumien.
- Elles inspirent aussi des constructions de confidentialité comme certains coinjoins chaumiens.
- Elles ne suffisent pas à créer une monnaie décentralisée sans émetteur.

## Limites et confusions

Elle ne supprime ni la garde ni les autres métadonnées du système.

## Approfondissements

- [[cashu-et-confiance-dans-le-mint.fr|L’ecash et la confiance dans un mint]] pour revenir à la notion de base.
- [[coinjoin.fr|Comprendre CoinJoin]] pour revenir à la notion de base.

## Références

- PlanB his201 — The History of Bitcoin's Creation
