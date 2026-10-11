---
type: "project_note"
id: "lightning-routing"
title: "Le routage d’un paiement"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["Lightning Routing"]
parent_ids: []
related_ids: ["lightning-liquidity-path", "multi-path-payment", "secondary-lightning-lightning-gossip-protocol", "secondary-lightning-lightning-public-channel", "secondary-lightning-onion-routing"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB lnp201 — Lightning Network Theory"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Le routage d’un paiement

## Questions couvertes

- Comment un paiement traverse-t-il plusieurs canaux ?

## Réponse courte

Le routage Lightning cherche 1 ou plusieurs chemins de canaux entre le payeur et le destinataire. Ils n’ont pas besoin de posséder un canal direct entre eux.

## Explication

Les nœuds disposent d’informations sur une partie de la topologie et sur les politiques de frais. Le wallet cherche un trajet compatible avec le montant et ses contraintes, puis peut réessayer si la route échoue.

La capacité annoncée d’un canal ne révèle pas toute sa liquidité utilisable dans chaque sens. Un chemin qui paraît possible peut donc ne pas permettre le paiement au moment de l’essai. Les paiements en plusieurs parties répartissent le montant entre des chemins pour mieux utiliser une liquidité fragmentée. Ils demandent aussi une coordination à destination.

## Limites et confusions

Avoir un canal ouvert ne garantit pas de pouvoir payer tous les destinataires à tout moment. Des nœuds indisponibles, des politiques de frais ou une liquidité mal répartie peuvent empêcher la route.

Le routage onion limite les informations visibles par chaque intermédiaire, mais ne rend pas toutes les métadonnées invisibles. Pour expliquer un échec, distinguer les fonds disponibles au départ, la réception à destination et les contraintes des chemins intermédiaires.

## Approfondissements

- [[lightning-liquidity-path.fr|Liquidité et chemins de paiement Lightning]] — Liquidité et chemins — examiner les goulots de passage
- [[multi-path-payment.fr|Le paiement en plusieurs chemins]] — comprendre les fragments d’un paiement

- [[secondary-lightning-lightning-gossip-protocol.fr|La diffusion du graphe public Lightning]].
- [[secondary-lightning-lightning-public-channel.fr|Les canaux Lightning annoncés]].
- [[secondary-lightning-onion-routing.fr|Le routage en oignon de Lightning]].

## Références

- PlanB lnp201 — Lightning Network Theory (référence de la note source, non reconsultée directement pour cette adaptation).
