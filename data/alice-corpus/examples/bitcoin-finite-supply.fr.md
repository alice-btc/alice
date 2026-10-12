---
type: "project_note"
id: "bitcoin-finite-supply"
title: "La limite de l’offre de bitcoins"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["fundamentals"]
aliases: ["Bitcoin Finite Supply"]
parent_ids: []
related_ids: ["bitcoin-monetary-policy", "bitcoin-halving", "lost-bitcoins", "secondary-economics-coin-clipping", "secondary-economics-stock-to-flow-ratio"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc303 — Bitcoin Development Philosophy"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La limite de l’offre de bitcoins

## Questions couvertes

- Pourquoi parle-t-on de 21 millions ?

## Réponse courte

Le plafond couramment résumé à 21 millions de BTC découle des règles d’émission de Bitcoin. Les nœuds refusent les blocs qui créent davantage que la subvention autorisée.

## Explication

La subvention commence à un montant déterminé puis diminue par halvings successifs. Avec des montants entiers en satoshis, elle finit par devenir nulle. La somme de cette émission reste légèrement inférieure à 21 millions. Ce mécanisme est distinct des frais, qui transfèrent des bitcoins existants aux mineurs.

Il faut aussi distinguer l’offre théoriquement émise et l’offre encore utilisable. Certains bitcoins sont devenus impossibles à dépenser ou leurs détenteurs ont perdu les moyens de les récupérer. Ces pertes ne provoquent pas une émission compensatoire.

## Limites et confusions

La rareté ne garantit ni demande, ni pouvoir d’achat, ni hausse de prix. Un changement de logiciel ne peut pas imposer automatiquement un nouveau plafond aux nœuds qui gardent les règles précédentes. Le code comprend aussi des contrôles de montant ; le calendrier d’émission explique le total, plutôt qu’un compteur central arrêtant les paiements.

## Approfondissements

- [[bitcoin-monetary-policy.fr|L’émission monétaire de Bitcoin]].
- [[bitcoin-halving.fr|Le halving]].
- [[lost-bitcoins.fr|Les bitcoins perdus]].

- [[secondary-economics-coin-clipping.fr|Le rognage historique des pièces]].
- [[secondary-economics-stock-to-flow-ratio.fr|Le ratio stock-flux et ses limites]].

## Références

- PlanB btc303 — Bitcoin Development Philosophy.
