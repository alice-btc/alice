---
type: "project_note"
id: "inbound-liquidity"
title: "La capacité de réception"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["Inbound Liquidity", "Lightning Inbound Liquidity Market"]
parent_ids: []
related_ids: ["lightning-liquidity-path", "lightning-service-provider", "secondary-lightning-just-in-time-lightning-channel"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB lnp201 — Lightning Network Theory"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La capacité de réception

## Questions couvertes

- Pourquoi ne puis-je pas recevoir ce montant ?

## Réponse courte

La liquidité entrante est la capacité de recevoir sur Lightning. Il faut que des fonds situés du côté distant de vos canaux puissent être transférés vers vous.

## Explication

Lorsque vous financez seul un nouveau canal, les fonds sont principalement de votre côté. Cela donne de la capacité d’envoi, mais pas automatiquement une capacité équivalente de réception. Après un paiement sortant, une part de la liquidité se trouve chez votre pair et peut permettre une réception ultérieure.

On peut aussi obtenir de la capacité entrante par un canal financé par un autre participant, un service de liquidité ou certaines opérations de swap. Ces mécanismes ont des frais et des dépendances qu’il faut comprendre. La réception requiert également une route praticable jusqu’à vos canaux.

## Limites et confusions

La somme théorique des capacités entrantes ne garantit pas qu’un paiement précis passera. La répartition entre canaux et les contraintes sur les routes comptent. Un paiement en plusieurs parties peut aider sans résoudre tous les blocages.

Un service custodial peut gérer tout cela pour l’utilisateur ; cette simplicité ne démontre pas que l’utilisateur détient lui-même les clés. Il faut distinguer la gestion de liquidité de la garde des fonds.

## Approfondissements

- [[lightning-liquidity-path.fr|Liquidité et chemins de paiement Lightning]] — Liquidité et chemins — voir les contraintes de réception
- [[lightning-service-provider.fr|Les fournisseurs de services Lightning]] — comprendre l’aide d’un fournisseur de liquidité

- [[secondary-lightning-just-in-time-lightning-channel.fr|Les canaux ouverts à la demande]].

## Références

- PlanB lnp201 — Lightning Network Theory (référence de la note source, non reconsultée directement pour cette adaptation).
