---
type: "project_note"
id: "alice-rag"
title: "Les connaissances consultées par Alice"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Alice App et apprentissage"]
aliases: ["docs/RAG_EVALUATION.md"]
parent_ids: []
related_ids: ["alice-app-overview", "alice-user-memory"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["alice-repo:46e2e9da:docs/RAG_EVALUATION.md"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les connaissances consultées par Alice

## Questions couvertes

- Pourquoi une réponse peut-elle citer des connaissances du corpus ?

## Réponse courte

Le RAG permet à Alice de rechercher des passages dans un corpus documentaire avant de répondre. Il aide à fournir un contexte pertinent au modèle, mais ne garantit pas que la réponse sera correcte.

## Explication

La recherche et la rédaction sont des étapes distinctes. Alice peut retrouver la bonne note et néanmoins mal la résumer, omettre une condition ou inventer un lien entre plusieurs passages. L’évaluation doit donc vérifier à la fois les documents retenus et le contenu produit.

La documentation au commit 46e2e9da décrit des jeux de questions séparant le développement et l’acceptation. Les verdicts automatiques constituent un indicateur reproductible selon la méthode utilisée, pas une validation humaine exhaustive. Les résultats d’une version et d’un modèle ne doivent pas être attribués automatiquement aux autres.

## Limites et confusions

Le corpus préparé avec un socle et des approfondissements exprime une politique documentaire. Sa présence dans des fichiers ne prouve pas que le moteur actif l’importe ni qu’il applique déjà le routage à 2 niveaux.

Alice doit présenter les sources comme des appuis à examiner et conserver leurs limites. Une note secondaire n’est pas moins vraie par définition ; elle est consultée pour apporter un détail utile sans encombrer une réponse d’introduction. Le bon passage doit rester accessible dès qu’une question le nécessite.

## Approfondissements

- [[alice-app-overview.fr|Se repérer dans Alice App]] — situer le rôle pédagogique d’Alice
- [[alice-user-memory.fr|La mémoire personnelle d’Alice]] — distinguer connaissances et personnalisation

## Références

- [Évaluation du RAG au commit 46e2e9da](alice-repo:46e2e9da:docs/RAG_EVALUATION.md).
