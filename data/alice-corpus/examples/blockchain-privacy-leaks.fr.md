---
type: "project_note"
id: "blockchain-privacy-leaks"
title: "Les informations publiques sur la chaîne"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Blockchain Privacy Leaks"]
parent_ids: []
related_ids: ["bitcoin-transaction-structure", "common-input-ownership-heuristic", "change-privacy-linking", "secondary-bitcoin-confidential-transactions"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc303 — Bitcoin Development Philosophy"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les informations publiques sur la chaîne

## Questions couvertes

- Quelles données une transaction révèle-t-elle ?

## Réponse courte

Les transactions Bitcoin publient des montants, des entrées, des sorties et des relations avec des transactions antérieures. Ces données servent à vérifier les dépenses, mais permettent aussi d’étudier les flux.

## Explication

Une réutilisation d’adresse relie directement plusieurs réceptions au même identifiant. Une dépense réunissant plusieurs entrées peut suggérer un contrôle commun. Les montants et la monnaie rendue donnent d’autres indices sur la structure d’un paiement.

Ces observations prennent davantage de sens lorsqu’un acteur possède des données externes, comme une facture ou l’identité d’un client. Les traces restent disponibles pour de nouvelles analyses après leur publication.

## Limites et confusions

La chaîne ne raconte pas toute l’histoire économique. Une transaction peut être un transfert entre portefeuilles d’une même personne, un paiement groupé ou une collaboration. Les interprétations de propriété et de monnaie rendue doivent donc rester distinctes des données certaines. Réduire une fuite ne garantit pas l’absence de liens par un autre canal.

## Approfondissements

- [[bitcoin-transaction-structure.fr|Lire une transaction dans un explorateur]].
- [[common-input-ownership-heuristic.fr|L’hypothèse des entrées communes]].
- [[change-privacy-linking.fr|Monnaie rendue et liens de confidentialité]].

- [[secondary-bitcoin-confidential-transactions.fr|Les transactions confidentielles]].

## Références

- PlanB btc303 — Bitcoin Development Philosophy.
