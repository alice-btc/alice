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
reviewed_at: "2026-11-06"
review_due: null
sources: ["PlanB lnp201 — Lightning Network Theory", "https://github.com/lightning/bolts/blob/master/11-payment-encoding.md"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# Les factures Lightning

## Questions couvertes

- Pourquoi une facture Lightning peut-elle expirer ?

## Réponse courte

Une facture Lightning est une demande de paiement lisible par un portefeuille compatible. Elle fournit les informations nécessaires pour payer, avec notamment une destination, une échéance et parfois un montant fixé.

## Explication

Dans l’usage classique, le destinataire génère une facture BOLT11 et la transmet sous forme de texte ou de QR code. Le portefeuille du payeur la décode pour présenter les informations avant confirmation. La facture peut demander un montant précis ou laisser le payeur en choisir un.

BOLT11 est encodé, pas chiffré : quiconque possède la facture peut décoder ses champs. Une facture comportant un montant révèle ce montant encodé. La clé publique du nœud destinataire figure explicitement dans le champ n ou se récupère à partir de la signature ; ce n’est pas le hash de paiement du champ p. Ce hash identifie la condition de paiement, pas une adresse on-chain ni la clé publique du destinataire. L’horodatage, l’expiration, une description ou son hash et des indices de routage facultatifs peuvent aussi être visibles. Une clé publique de nœud ne prouve pas une identité civile. Publier la facture peut permettre des rapprochements, sans révéler en soi les clés privées, la seed ou tout l’historique d’achat.

L’échéance évite qu’une ancienne demande reste utilisée indéfiniment. Les indices de routage sont facultatifs : ils aident à atteindre le destinataire, souvent par des canaux non annoncés, et peuvent révéler ces canaux. Ils décrivent les derniers sauts vers le destinataire, pas le trajet que prendra le paiement, que le portefeuille du payeur calcule. Modifier le moindre caractère invalide la somme de contrôle et la signature de la facture : une facture partiellement masquée ou retouchée ne peut plus être payée. La facture contient aussi des éléments cryptographiques employés par le mécanisme de règlement. Elle décrit une demande ; elle ne prouve pas à elle seule que le paiement a eu lieu.

## Limites et confusions

Une facture Lightning n’est pas une adresse Bitcoin on-chain. Un QR code peut contenir différents formats ; son apparence ne suffit pas à savoir comment payer.

Pour une nouvelle demande, il est préférable d’obtenir une facture fraîche plutôt que de supposer qu’une facture déjà réglée sera réutilisable. Une offre BOLT12 ou une Lightning Address peut rester stable tout en servant à obtenir de nouvelles factures.

## Approfondissements

- [[bolt12-offers.fr|Les offres BOLT12]] — distinguer offre réutilisable et facture
- [[lightning-address.fr|Les adresses Lightning]] — comprendre un identifiant de réception stable

## Références

- PlanB lnp201 — Lightning Network Theory (référence de la note source, non reconsultée directement pour cette adaptation).

- https://github.com/lightning/bolts/blob/master/11-payment-encoding.md
