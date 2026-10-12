---
type: "project_note"
id: "outbound-liquidity"
title: "La capacité d’envoi"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["Outbound Liquidity"]
parent_ids: []
related_ids: ["lightning-liquidity-path", "lightning-routing"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB lnp202 — Set up Your First Lightning Node"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La capacité d’envoi

## Questions couvertes

- Quelle quantité puis-je envoyer par un canal ?

## Réponse courte

La liquidité sortante est la capacité d’envoyer des sats par vos canaux Lightning. Elle dépend des fonds disponibles de votre côté, puis des routes permettant de rejoindre le destinataire.

## Explication

Financer un canal apporte généralement de la capacité d’envoi à celui qui fournit les fonds. Quand il paie, la répartition se déplace vers le pair ; quand il reçoit, des fonds reviennent de son côté. La capacité totale du canal peut rester identique pendant ces échanges.

Il faut distinguer la part locale brute du montant effectivement envoyable. Les réserves de canal, les frais nécessaires et les paiements déjà engagés peuvent limiter l’envoi immédiat. Un portefeuille peut déjà tenir compte de ces contraintes dans son affichage, selon l’indicateur choisi.

## Limites et confusions

Avoir assez de fonds au départ ne garantit pas que toutes les routes possèdent assez de liquidité jusqu’au destinataire. Inversement, un échec ne signifie pas nécessairement que les fonds ont disparu.

La réserve n’est pas une somme confisquée par l’autre participant. Elle reste liée au règlement du canal mais limite certains paiements lorsqu’il est ouvert. Pour une opération réelle, utiliser le montant envoyable indiqué par le logiciel et examiner le devis de frais.

## Approfondissements

- [[lightning-liquidity-path.fr|Liquidité et chemins de paiement Lightning]] — Liquidité et chemins — distinguer fonds locaux et disponibilité
- [[lightning-routing.fr|Le routage d’un paiement]] — comprendre les routes intermédiaires

## Références

- PlanB lnp202 — Set up Your First Lightning Node (référence de la note source, non reconsultée directement pour cette adaptation).
