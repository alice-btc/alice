---
type: "project_note"
id: "bitcoin-protocol"
title: "Les règles de Bitcoin"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["fundamentals"]
aliases: ["Bitcoin Protocol"]
parent_ids: []
related_ids: ["bitcoin-node", "bitcoin-core", "bitcoin-mempool-policy"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc101 — The Bitcoin Journey", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les règles de Bitcoin

## Questions couvertes

- Qu’est-ce qui définit Bitcoin ?

## Réponse courte

Le protocole Bitcoin est l’ensemble des règles qui permettent de construire, échanger et vérifier des transactions et des blocs sans administrateur central du registre.

## Explication

Un portefeuille prépare une transaction et les signatures nécessaires. Les nœuds vérifient qu’elle respecte leurs règles et peuvent la transmettre à leurs pairs. Les mineurs proposent des blocs ; les nœuds rejettent ceux qui enfreignent les règles de consensus qu’ils appliquent.

Ces règles encadrent notamment les dépenses autorisées, l’absence de double dépense et la création de nouveaux bitcoins. Elles sont exécutées par des logiciels. Bitcoin Core est une implémentation importante, mais le protocole n’est pas le compte d’une entreprise ni une base de données administrée par ses développeurs.

## Limites et confusions

Le protocole, le logiciel et les usages ne sont pas synonymes. Publier un nouveau logiciel ne contraint pas tous les utilisateurs à l’adopter. Certaines règles de transmission des transactions sont locales aux nœuds et se distinguent des règles qui rendent un bloc valide. Les évolutions demandent donc de préciser ce qui change et qui l’applique.

## Approfondissements

- [[bitcoin-node.fr|Le rôle d’un nœud Bitcoin]].
- [[bitcoin-core.fr|Le logiciel Bitcoin Core]].
- [[bitcoin-mempool-policy.fr|Règles locales et consensus]].

## Références

- PlanB btc101 — The Bitcoin Journey.
- PlanB Extraction — 2026-05-23.
