---
type: "project_note"
id: "mining-pool"
title: "Les pools de minage"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Minage et énergie"]
aliases: ["Mining Pool"]
parent_ids: []
related_ids: ["solo-bitcoin-mining", "mining-centralization", "secondary-bitcoin-mining-shares", "secondary-bitcoin-mining-variance", "secondary-bitcoin-no-kyc-mining-rewards", "secondary-bitcoin-pool-payout-methods", "secondary-bitcoin-stratum-mining-protocol"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB min101 — Introduction to Bitcoin mining", "PlanB min304 — Heat your home while mining bitcoins"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les pools de minage

## Questions couvertes

- Pourquoi des mineurs se regroupent-ils ?

## Réponse courte

Un pool de minage mutualise les contributions de plusieurs mineurs et répartit les revenus selon ses règles. Il rend généralement les paiements plus réguliers que le minage en solo.

## Explication

Un petit mineur peut attendre très longtemps avant de trouver seul un bloc. Dans un pool classique, il soumet des preuves de travail partielles, appelées shares, qui permettent d’estimer sa contribution. Le mode de paiement précise comment cette contribution est rémunérée et quels risques restent supportés par le mineur ou le pool.

Le pool peut fournir les blocs candidats sur lesquels travaillent les machines. Cela distingue la propriété du matériel du pouvoir de sélectionner les transactions. Plusieurs propriétaires de machines peuvent ainsi dépendre du même opérateur pour la construction des blocs.

## Limites et confusions

Un pool ne crée pas de bitcoins supplémentaires pour une même quantité de travail. Il change principalement la répartition des revenus et leur variabilité, avec des frais et des conditions propres.

Un service de « solo pool » fournit une infrastructure mais ne mutualise pas nécessairement les gains. Il faut regarder le mode de paiement, les seuils de retrait et la gestion des blocs, plutôt que le nom du service.

## Approfondissements

- [[solo-bitcoin-mining.fr|Le minage en solo]] — comparer la variabilité des gains
- [[mining-centralization.fr|La concentration du minage]] — séparer matériel et construction des blocs

- [[secondary-bitcoin-mining-shares.fr|Les parts de travail des pools]].
- [[secondary-bitcoin-mining-variance.fr|L’irrégularité des résultats du minage]].
- [[secondary-bitcoin-no-kyc-mining-rewards.fr|Recevoir des récompenses sans KYC]].
- [[secondary-bitcoin-pool-payout-methods.fr|Les méthodes de rémunération des pools]].
- [[secondary-bitcoin-stratum-mining-protocol.fr|Le protocole Stratum]].

## Références

- PlanB min101 — Introduction to Bitcoin mining (référence de la note source, non reconsultée directement pour cette adaptation).
- PlanB min304 — Heat your home while mining bitcoins (référence de la note source, non reconsultée directement pour cette adaptation).
