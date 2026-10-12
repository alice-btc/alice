---
type: "project_note"
id: "bitcoin-consensus"
title: "Le consensus"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Cryptographie et limites du protocole"]
aliases: ["Bitcoin Consensus"]
parent_ids: []
related_ids: ["51-attack", "bitcoin-governance", "secondary-bitcoin-bitcoin-security-assumptions", "secondary-bitcoin-consensus-critical-dependency-risk", "secondary-bitcoin-sybil-attack", "secondary-governance-chain-split-risk", "secondary-history-bip50-chain-split"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc101 — The Bitcoin Journey"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Le consensus

## Questions couvertes

- Comment des nœuds indépendants appliquent-ils les mêmes règles ?

## Réponse courte

Le consensus Bitcoin permet aux nœuds de converger vers un même historique valide. Chaque nœud applique des règles de validité et compare le travail accumulé des chaînes qui les respectent.

## Explication

Les mineurs proposent des blocs. Les nœuds vérifient notamment les transactions, les conditions de dépense et l’émission autorisée. Une quantité élevée de travail ne rend pas acceptable un bloc invalide selon leurs règles.

Des blocs concurrents peuvent apparaître temporairement. La progression du travail accumulé aide les nœuds à départager les chaînes valides. C’est pourquoi une confirmation n’offre pas la même assurance que plusieurs blocs supplémentaires construits après la transaction.

## Limites et confusions

Le consensus n’est pas un vote simple où chaque ordinateur ou chaque mineur disposerait d’une voix pour changer les règles à volonté. Produire des blocs et choisir les règles à vérifier sont des rôles distincts.

Une divergence de règles peut conduire des groupes à suivre des historiques incompatibles. La gouvernance, qui organise la discussion et l’adoption des changements, complète donc le mécanisme technique sans se confondre avec lui. Le modèle suppose aussi des conditions de réseau et de puissance de calcul ; il ne garantit pas l’absence absolue d’attaque.

## Approfondissements

- [[51-attack.fr|L’attaque majoritaire]] — comprendre les limites de la majorité minière
- [[bitcoin-governance.fr|L’évolution des règles]] — distinguer mécanisme et évolution des règles

- [[secondary-bitcoin-bitcoin-security-assumptions.fr|Les hypothèses de sécurité de Bitcoin]].
- [[secondary-bitcoin-consensus-critical-dependency-risk.fr|Les dépendances logicielles critiques pour le consensus]].
- [[secondary-bitcoin-sybil-attack.fr|Les attaques Sybil]].
- [[secondary-governance-chain-split-risk.fr|Le risque de divergence entre chaînes]].
- [[secondary-history-bip50-chain-split.fr|La scission accidentelle de mars 2013]].

## Références

- PlanB btc101 — The Bitcoin Journey (référence de la note source, non reconsultée directement pour cette adaptation).
