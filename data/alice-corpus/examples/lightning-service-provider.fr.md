---
type: "project_note"
id: "lightning-service-provider"
title: "Les fournisseurs de services Lightning"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["Lightning Service Provider", "Lightning Inbound Liquidity Market"]
parent_ids: []
related_ids: ["lightning-privacy-tradeoff", "inbound-liquidity", "secondary-bitcoin-lightning-offline-receiving-problem", "secondary-lightning-just-in-time-lightning-channel", "secondary-lightning-lightning-node-recovery-tradeoff"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB pro101 — Bitcoin Development Fundamentals"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les fournisseurs de services Lightning

## Questions couvertes

- Que fait un LSP ?

## Réponse courte

Un Lightning Service Provider, ou LSP, aide un portefeuille à obtenir des canaux, de la liquidité et une meilleure disponibilité. Il peut simplifier l’usage sans nécessairement détenir les clés de l’utilisateur.

## Explication

Un nouveau wallet peut manquer de capacité de réception ou avoir du mal à rester disponible. Selon son architecture, le LSP facilite l’ouverture de canaux, apporte de la liquidité ou maintient une connexion adaptée. Certaines fonctions peuvent être déclenchées au moment du premier paiement.

Cette organisation évite à l’utilisateur de gérer chaque détail opérationnel. Elle introduit cependant un service avec des tarifs, des contraintes et des informations visibles. L’utilisateur doit savoir ce qui se passe si ce prestataire devient indisponible.

## Limites et confusions

LSP et portefeuille custodial ne sont pas des synonymes. Le critère principal reste le contrôle des clés et la possibilité de récupérer les fonds sans dépendre d’une décision discrétionnaire du fournisseur. Cette récupération peut elle-même avoir des délais et des coûts.

« Non custodial » ne signifie pas absence de dépendance ni confidentialité totale. Le fournisseur peut observer des montants, des horaires ou des besoins de liquidité selon le fonctionnement du wallet.

## Approfondissements

- [[lightning-privacy-tradeoff.fr|La confidentialité sur Lightning]] — examiner les informations révélées
- [[inbound-liquidity.fr|La capacité de réception]] — comprendre le besoin de réception

- [[secondary-bitcoin-lightning-offline-receiving-problem.fr|Recevoir sur Lightning en étant hors ligne]].
- [[secondary-lightning-just-in-time-lightning-channel.fr|Les canaux ouverts à la demande]].
- [[secondary-lightning-lightning-node-recovery-tradeoff.fr|Les dépendances de récupération d’un nœud Lightning]].

## Références

- PlanB pro101 — Bitcoin Development Fundamentals (référence de la note source, non reconsultée directement pour cette adaptation).
