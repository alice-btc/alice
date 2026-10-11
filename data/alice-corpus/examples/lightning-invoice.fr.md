---
type: "project_note"
id: "lightning-invoice"
title: "Les factures Lightning"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["Lightning Invoice"]
parent_ids: []
related_ids: ["bolt12-offers", "lightning-address"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB lnp201 — Lightning Network Theory"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les factures Lightning

## Questions couvertes

- Pourquoi une facture Lightning peut-elle expirer ?

## Réponse courte

Une facture Lightning est une demande de paiement lisible par un portefeuille compatible. Elle fournit les informations nécessaires pour payer, avec notamment une destination, une échéance et parfois un montant fixé.

## Explication

Dans l’usage classique, le destinataire génère une facture BOLT11 et la transmet sous forme de texte ou de QR code. Le portefeuille du payeur la décode pour présenter les informations avant confirmation. La facture peut demander un montant précis ou laisser le payeur en choisir un.

L’échéance évite qu’une ancienne demande reste utilisée indéfiniment. Des informations de routage aident à atteindre le destinataire. La facture contient aussi des éléments cryptographiques employés par le mécanisme de règlement. Elle décrit une demande ; elle ne prouve pas à elle seule que le paiement a eu lieu.

## Limites et confusions

Une facture Lightning n’est pas une adresse Bitcoin on-chain. Un QR code peut contenir différents formats ; son apparence ne suffit pas à savoir comment payer.

Pour une nouvelle demande, il est préférable d’obtenir une facture fraîche plutôt que de supposer qu’une facture déjà réglée sera réutilisable. Une offre BOLT12 ou une Lightning Address peut rester stable tout en servant à obtenir de nouvelles factures.

## Approfondissements

- [[bolt12-offers.fr|Les offres BOLT12]] — distinguer offre réutilisable et facture
- [[lightning-address.fr|Les adresses Lightning]] — comprendre un identifiant de réception stable

## Références

- PlanB lnp201 — Lightning Network Theory (référence de la note source, non reconsultée directement pour cette adaptation).
