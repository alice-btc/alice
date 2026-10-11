---
type: "project_note"
id: "change-output"
title: "La monnaie rendue"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Change Output"]
parent_ids: []
related_ids: ["bitcoin-utxo", "change-privacy-linking", "coin-selection-tradeoffs"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB pro202 — Programming Bitcoin"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La monnaie rendue

## Questions couvertes

- Pourquoi une partie du paiement revient-elle à une autre adresse ?

## Réponse courte

La monnaie rendue, ou « change », est une sortie qui renvoie au payeur la valeur non utilisée pour le paiement et les frais. Elle apparaît parce qu’un UTXO est dépensé entièrement.

## Explication

Exemple fictif avec 1 entrée de 10 000 sats. Un paiement de 6 000 sats et 500 sats de frais laissent 3 500 sats de monnaie rendue. Le portefeuille crée normalement une sortie contrôlée par ses propres clés pour ce reste. L’adresse peut être nouvelle sans que les fonds aient quitté le portefeuille.

Cela explique pourquoi une transaction simple peut montrer plusieurs sorties et un montant total transféré supérieur au paiement commercial. Le portefeuille suit ses propres sorties pour calculer le solde restant.

## Limites et confusions

Toutes les transactions n’ont pas de monnaie rendue. Son montant doit aussi tenir compte des frais. La supprimer sans modifier correctement la transaction peut accroître les frais. Utiliser une nouvelle adresse améliore certaines pratiques, mais des observateurs peuvent encore essayer d’identifier la monnaie rendue par des heuristiques.

## Approfondissements

- [[bitcoin-utxo.fr|Comprendre les UTXO]].
- [[change-privacy-linking.fr|Monnaie rendue et liens de confidentialité]].
- [[coin-selection-tradeoffs.fr|Sélection des UTXO et compromis]].

## Références

- PlanB pro202 — Programming Bitcoin.
