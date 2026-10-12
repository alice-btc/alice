---
type: "project_note"
id: "secondary-bitcoin-validationless-mining"
title: "Miner sans avoir validé le bloc précédent"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Validationless Mining"]
parent_ids: ["bitcoin-mining", "full-node"]
related_ids: ["bitcoin-mining", "full-node"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB btc303 — Bitcoin Development Philosophy"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Miner sans avoir validé le bloc précédent

## Questions couvertes

- Quel risque prend un mineur qui commence à travailler trop vite sur un bloc reçu ?

## Réponse courte

Miner sur un bloc reçu avant de l'avoir validé peut prolonger une branche invalide et faire perdre des revenus au mineur.

## Explication

- Le mineur vérifie éventuellement seulement le header et la preuve de travail.
- Cette pratique peut étendre une chaîne invalide si le bloc parent est invalide.
- BIP66 a produit des splits temporaires à cause de mineurs qui signalaient sans valider.
- Elle montre pourquoi les mineurs eux-mêmes doivent utiliser de vrais full nodes.

## Limites et confusions

Une preuve de travail valide ne suffit pas à prouver que toutes les règles du bloc sont respectées.

## Approfondissements

- [[bitcoin-mining.fr|Comprendre le minage]] pour revenir à la notion de base.
- [[full-node.fr|La validation complète]] pour revenir à la notion de base.

## Références

- PlanB btc303 — Bitcoin Development Philosophy
