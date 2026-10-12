---
type: "project_note"
id: "bitcoin-payments-for-merchants"
title: "Accepter un paiement Bitcoin"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Usages et comparaisons"]
aliases: ["Bitcoin Payments for Merchants"]
parent_ids: []
related_ids: ["btcpay-server", "unit-of-account", "secondary-bitcoin-bitcoin-circular-economy", "secondary-bitcoin-bitcoin-payment-conversion-policy", "secondary-bitcoin-btc-map", "secondary-bitcoin-btcpay-invoices", "secondary-bitcoin-exchange-rate-risk", "secondary-bitcoin-self-hosted-payment-processor"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://docs.btcpayserver.org/BTCPayVsOthers/"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Accepter un paiement Bitcoin

## Questions couvertes

- Quelles questions un commerçant doit-il se poser ?

## Réponse courte

Un commerçant peut accepter Bitcoin directement ou par un prestataire, sur la chaîne ou via Lightning. Le bon fonctionnement demande d’organiser le prix, la réception, le suivi et les éventuels remboursements.

## Explication

Le marchand choisit d’abord qui contrôle les fonds et s’il les conserve en BTC ou les convertit. Il doit ensuite définir la durée d’une facture, le montant attendu et les conditions qui permettent de considérer le paiement reçu. Sur Lightning, la disponibilité et la liquidité de réception comptent ; sur la chaîne, les confirmations et les frais interviennent.

Les coûts peuvent inclure réseau, hébergement, liquidité, conversion et commission du prestataire. BTCPay Server illustre un logiciel sans commission logicielle de traitement, mais l’infrastructure et les opérations restent susceptibles de coûter.

## Limites et confusions

« Accepter Bitcoin » ne signifie pas que toutes les solutions ont le même modèle de garde ni les mêmes frais. Une conversion automatique peut faciliter certains usages tout en ajoutant un intermédiaire.

Les obligations de facturation et de comptabilité dépendent de la juridiction et de l’activité. Conserver le montant, la date, les frais et le taux utilisé peut être nécessaire, mais aucune liste générique ne remplace une vérification du cadre applicable.

## Approfondissements

- [[btcpay-server.fr|Comprendre BTCPay Server]] — comprendre une infrastructure de facturation
- [[unit-of-account.fr|L’unité de compte]] — séparer prix affiché et actif reçu

- [[secondary-bitcoin-bitcoin-circular-economy.fr|Les économies circulaires Bitcoin]].
- [[secondary-bitcoin-bitcoin-payment-conversion-policy.fr|Conserver ou convertir les paiements reçus]].
- [[secondary-bitcoin-btc-map.fr|Trouver des commerces avec BTC Map]].
- [[secondary-bitcoin-btcpay-invoices.fr|Les factures BTCPay]].
- [[secondary-bitcoin-exchange-rate-risk.fr|Le risque de change lors d’un paiement]].
- [[secondary-bitcoin-self-hosted-payment-processor.fr|Auto-héberger son traitement de paiement]].

## Références

- [BTCPay Server, comparaison des modèles de paiement](https://docs.btcpayserver.org/BTCPayVsOthers/).
