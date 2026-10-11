---
type: "project_note"
id: "bitcoin-core"
title: "Le logiciel Bitcoin Core"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["nodes"]
aliases: ["Bitcoin Core"]
parent_ids: []
related_ids: ["bitcoin-protocol", "bitcoin-mempool-policy", "software-integrity-verification", "secondary-bitcoin-bitcoin-core-development-funding", "secondary-bitcoin-bitcoin-core-maintenance", "secondary-bitcoin-consensus-critical-dependency-risk", "secondary-bitcoin-open-source-security-review", "secondary-nodes-bitcoin-indexer", "secondary-nodes-node-in-a-box"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB Extraction — 2026-05-23", "PlanB btc202 — Setting up your first Bitcoin node"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Le logiciel Bitcoin Core

## Questions couvertes

- Quelle différence entre Bitcoin et Bitcoin Core ?

## Réponse courte

Bitcoin Core est un logiciel qui implémente les règles de Bitcoin et permet notamment de faire fonctionner un nœud. Le logiciel, le protocole et le réseau d’utilisateurs sont 3 réalités distinctes.

## Explication

Le logiciel vérifie les blocs et les transactions, échange avec des pairs et propose des fonctions locales. Son code évolue par des contributions et des revues. Une version publiée doit encore être adoptée par les personnes qui exploitent des nœuds.

Cette distinction aide à comprendre les débats. Une modification de politique de relais locale n’est pas nécessairement une modification des règles de consensus. Les développeurs ne possèdent pas un bouton permettant de modifier les soldes de tous les utilisateurs.

## Limites et confusions

L’importance de Bitcoin Core ne signifie pas que tout utilisateur exécute le même logiciel ou la même version. Le caractère ouvert du code facilite l’examen sans garantir l’absence de bug. Il faut dater les affirmations sur une version précise et vérifier les notes de changement avant de présenter une fonctionnalité comme disponible.

## Approfondissements

- [[bitcoin-protocol.fr|Les règles de Bitcoin]].
- [[bitcoin-mempool-policy.fr|Règles locales et consensus]].
- [[software-integrity-verification.fr|Vérifier un téléchargement]].

- [[secondary-bitcoin-bitcoin-core-development-funding.fr|Le financement du développement de Bitcoin Core]].
- [[secondary-bitcoin-bitcoin-core-maintenance.fr|Le rôle des responsables de maintenance de Bitcoin Core]].
- [[secondary-bitcoin-consensus-critical-dependency-risk.fr|Les dépendances logicielles critiques pour le consensus]].
- [[secondary-bitcoin-open-source-security-review.fr|La revue de sécurité du code ouvert]].
- [[secondary-nodes-bitcoin-indexer.fr|Les indexeurs Bitcoin]].
- [[secondary-nodes-node-in-a-box.fr|Les solutions de nœud prêtes à installer]].

## Références

- PlanB Extraction — 2026-05-23.
- PlanB btc202 — Setting up your first Bitcoin node.
