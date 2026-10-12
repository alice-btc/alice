---
type: "project_note"
id: "consolidation-transaction"
title: "La consolidation des UTXO"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Consolidation Transaction"]
parent_ids: []
related_ids: ["coin-control", "common-input-ownership-heuristic", "transaction-batching"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc204 — Privacy on Bitcoin", "PlanB Extraction — 2026-05-23 — btc303"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La consolidation des UTXO

## Questions couvertes

- Pourquoi regrouper des UTXO et quels compromis cela implique-t-il ?

## Réponse courte

Une consolidation réunit plusieurs UTXO dans un nombre plus réduit de sorties. Elle peut simplifier les dépenses futures, tout en créant un lien public entre des fonds auparavant séparés.

## Explication

Dépenser de nombreux petits UTXO exige plusieurs entrées. Les regrouper peut diminuer le nombre d’entrées nécessaire à une opération ultérieure. Le raisonnement économique dépend des frais payés maintenant et de ceux qui seraient payés plus tard ; les frais futurs ne sont pas connus avec certitude.

Du point de vue de la confidentialité, la transaction associe explicitement ces fonds. Un observateur peut appliquer l’hypothèse de contrôle commun et rapprocher leurs historiques.

## Limites et confusions

Une consolidation n’est donc pas une simple optimisation sans contrepartie. Elle peut aussi créer de la monnaie rendue lors d’un futur paiement. Il faut la distinguer du batching, qui regroupe plusieurs paiements à des destinataires. La fiche explique un compromis général et ne recommande pas de réunir automatiquement tous les fonds d’un portefeuille.

## Approfondissements

- [[coin-control.fr|Choisir les fonds à dépenser]].
- [[common-input-ownership-heuristic.fr|L’hypothèse des entrées communes]].
- [[transaction-batching.fr|Regrouper plusieurs paiements]].

## Références

- PlanB btc204 — Privacy on Bitcoin.
- PlanB Extraction — 2026-05-23 — btc303.
