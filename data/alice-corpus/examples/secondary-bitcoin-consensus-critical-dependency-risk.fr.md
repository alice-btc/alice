---
type: "project_note"
id: "secondary-bitcoin-consensus-critical-dependency-risk"
title: "Les dépendances logicielles critiques pour le consensus"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Consensus-Critical Dependency Risk"]
parent_ids: ["bitcoin-consensus", "bitcoin-core"]
related_ids: ["bitcoin-consensus", "bitcoin-core"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB btc303 — Bitcoin Development Philosophy"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les dépendances logicielles critiques pour le consensus

## Questions couvertes

- Pourquoi une bibliothèque logicielle peut-elle provoquer une divergence entre nœuds ?

## Réponse courte

Si des versions de logiciel ou bibliothèques interprètent différemment une même donnée, les nœuds peuvent diverger sur la validité d'un bloc.

## Explication

- Des parseurs différents peuvent accepter ou refuser des signatures différemment.
- Une mise à jour de bibliothèque peut créer une divergence de consensus même si elle corrige un bug ailleurs.
- Bitcoin cherche à minimiser les dépendances qui touchent au consensus.
- BIP66 a réduit une dépendance problématique à OpenSSL pour l’encodage DER.

## Limites et confusions

Une correction logicielle isolée peut donc nécessiter des précautions de consensus supplémentaires.

## Approfondissements

- [[bitcoin-consensus.fr|Le consensus]] pour revenir à la notion de base.
- [[bitcoin-core.fr|Le logiciel Bitcoin Core]] pour revenir à la notion de base.

## Références

- PlanB btc303 — Bitcoin Development Philosophy
