---
type: "project_note"
id: "bitcoin-trustlessness"
title: "Vérifier plutôt que faire confiance"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["fundamentals"]
aliases: ["Bitcoin Trustlessness"]
parent_ids: []
related_ids: ["full-node", "self-custody", "threat-model", "secondary-bitcoin-bitcoin-security-assumptions"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc303 — Bitcoin Development Philosophy"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Vérifier plutôt que faire confiance

## Questions couvertes

- À qui faut-il faire confiance avec Bitcoin ?

## Réponse courte

Bitcoin permet de vérifier les règles du registre sans confier cette vérification à une institution centrale. Cela réduit certains besoins de confiance ; cela ne supprime pas toute confiance dans le monde réel.

## Explication

Un nœud complet contrôle les blocs, les dépenses et l’émission monétaire. Son utilisateur n’a donc pas besoin de croire un explorateur sur la validité de l’historique qu’il vérifie. En garde personnelle, les autorisations de dépense reposent sur ses propres clés plutôt que sur une promesse de retrait d’une plateforme.

Dans la pratique, la plupart des personnes utilisent des logiciels et du matériel qu’elles n’ont pas fabriqués ni audités intégralement. Un portefeuille connecté à un serveur tiers dépend aussi de ce serveur pour certaines informations.

## Limites et confusions

« Sans tiers de confiance » décrit un objectif et certaines propriétés du protocole, pas l’infaillibilité de chaque produit. Un nœud ne protège pas contre la divulgation d’une phrase de récupération. Un hardware wallet ne garantit pas que le destinataire choisi est honnête. Il faut identifier quelle fonction reste confiée à quel outil.

## Approfondissements

- [[full-node.fr|La validation complète]].
- [[self-custody.fr|La garde personnelle des clés]].
- [[threat-model.fr|Adapter la protection aux risques]].

- [[secondary-bitcoin-bitcoin-security-assumptions.fr|Les hypothèses de sécurité de Bitcoin]].

## Références

- PlanB btc303 — Bitcoin Development Philosophy.
