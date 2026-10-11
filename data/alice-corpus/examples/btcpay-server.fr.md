---
type: "project_note"
id: "btcpay-server"
title: "Comprendre BTCPay Server"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Usages et comparaisons"]
aliases: ["BTCPay Server"]
parent_ids: []
related_ids: ["bitcoin-payments-for-merchants", "lightning-node-backup", "secondary-bitcoin-btcpay-extended-public-key", "secondary-bitcoin-btcpay-hardware-wallet-integration", "secondary-bitcoin-btcpay-hot-wallet", "secondary-bitcoin-btcpay-invoices", "secondary-bitcoin-btcpay-security", "secondary-bitcoin-self-hosted-payment-processor"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc102 — Getting your first bitcoins"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Comprendre BTCPay Server

## Questions couvertes

- À quoi sert un serveur de paiement auto-hébergé ?

## Réponse courte

BTCPay Server est un logiciel open source permettant d’accepter des paiements Bitcoin, notamment on-chain et Lightning. Il peut être auto-hébergé afin de garder davantage de contrôle sur l’infrastructure marchande.

## Explication

Le logiciel organise des boutiques, des demandes de paiement et leur suivi. Il peut être relié aux composants nécessaires pour observer la chaîne et, pour Lightning, à une infrastructure adaptée. L’intégration au commerce peut concerner une caisse, un site ou des factures.

La maîtrise de l’hébergement et des clés permet de réduire certaines dépendances à un processeur custodial. Elle demande aussi de gérer les mises à jour, la disponibilité, les accès et les sauvegardes. Déléguer une partie de l’hébergement ne dispense pas de comprendre qui voit les données et qui contrôle les fonds.

## Limites et confusions

Un logiciel open source n’élimine pas tous les coûts. L’hébergement, le réseau, la liquidité Lightning ou des services tiers peuvent être facturés. Il ne suffit pas non plus à assurer la conformité comptable de chaque activité.

Les fonctions disponibles dépendent de la configuration et de la version. Cette fiche ne constitue pas un guide de déploiement ni un test d’une installation donnée. Pour une procédure, partir de la documentation correspondant à l’environnement réellement utilisé.

## Approfondissements

- [[bitcoin-payments-for-merchants.fr|Accepter un paiement Bitcoin]] — préparer le parcours marchand
- [[lightning-node-backup.fr|Les sauvegardes Lightning]] — comprendre les responsabilités de sauvegarde Lightning

- [[secondary-bitcoin-btcpay-extended-public-key.fr|Recevoir avec une clé publique étendue dans BTCPay]].
- [[secondary-bitcoin-btcpay-hardware-wallet-integration.fr|Signer les dépenses BTCPay avec un appareil dédié]].
- [[secondary-bitcoin-btcpay-hot-wallet.fr|Les clés privées sur un serveur BTCPay]].
- [[secondary-bitcoin-btcpay-invoices.fr|Les factures BTCPay]].
- [[secondary-bitcoin-btcpay-security.fr|Sécuriser une installation BTCPay]].
- [[secondary-bitcoin-self-hosted-payment-processor.fr|Auto-héberger son traitement de paiement]].

## Références

- PlanB btc102 — Getting your first bitcoins (référence de la note source, non reconsultée directement pour cette adaptation).
