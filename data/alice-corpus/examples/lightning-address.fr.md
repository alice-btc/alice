---
type: "project_note"
id: "lightning-address"
title: "Les adresses Lightning"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["Lightning Address"]
parent_ids: []
related_ids: ["lnurl", "lightning-invoice"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB pro101 — Bitcoin Development Fundamentals"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les adresses Lightning

## Questions couvertes

- Une adresse Lightning fonctionne-t-elle comme une adresse Bitcoin ?

## Réponse courte

Une Lightning Address est un identifiant de paiement qui ressemble à une adresse email. Elle permet à un portefeuille compatible de demander au service associé une facture Lightning.

## Explication

Au lieu de transmettre une longue facture à chaque fois, le destinataire communique un identifiant lisible. L’infrastructure repose généralement sur LNURL-pay. Le wallet contacte le service lié au domaine, obtient les informations de paiement, puis utilise une facture Lightning pour régler.

L’adresse peut être réutilisée, mais les demandes de paiement obtenues sont distinctes. La simplicité vient de cette résolution automatique. Elle ne remplace pas les canaux ni les contraintes de liquidité du réseau Lightning.

## Limites et confusions

Une Lightning Address n’est ni une adresse Bitcoin on-chain ni nécessairement une boîte email. Envoyer des BTC on-chain à cet identifiant n’a pas de sens sans mécanisme de conversion prévu par un service.

Le domaine et le serveur deviennent des dépendances de disponibilité et peuvent observer certaines métadonnées. Le format ne révèle pas le mode de garde du portefeuille derrière l’adresse. Avant de payer, vérifier l’identité du destinataire et les informations présentées par le wallet ; un nom lisible peut lui aussi être trompeur.

## Approfondissements

- [[lnurl.fr|Les liens LNURL]] — comprendre l’échange avec le service
- [[lightning-invoice.fr|Les factures Lightning]] — distinguer l’identifiant de la demande de paiement

## Références

- PlanB pro101 — Bitcoin Development Fundamentals (référence de la note source, non reconsultée directement pour cette adaptation).
