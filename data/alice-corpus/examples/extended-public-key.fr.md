---
type: "project_note"
id: "extended-public-key"
title: "La clé publique étendue"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["Extended Public Key"]
parent_ids: []
related_ids: ["watch-only-wallet", "derivation-path", "descriptor-wallet", "secondary-bitcoin-btcpay-extended-public-key", "secondary-bitcoin-hardened-derivation", "secondary-bitcoin-non-hardened-derivation"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La clé publique étendue

## Questions couvertes

- Que révèle une xpub ?

## Réponse courte

Une clé publique étendue, souvent appelée xpub, permet de dériver un ensemble de clés publiques dans une branche de portefeuille. Elle facilite le suivi sans donner, à elle seule, la capacité de signer.

## Explication

Un outil de consultation ou de réception peut l’utiliser avec les paramètres adaptés pour produire des adresses et rechercher leurs transactions. Il n’a pas besoin de recevoir les clés privées correspondantes. Cette séparation est notamment utilisée avec les portefeuilles en lecture seule.

Le partage dépasse cependant une adresse isolée. Selon la branche transmise, il peut exposer un historique et des adresses futures. Un serveur qui reçoit ces informations obtient donc une vue durable sur une partie du portefeuille.

## Limites et confusions

Une xpub doit être protégée comme une information de confidentialité. Elle ne représente pas nécessairement tout le portefeuille ni tous ses comptes. Elle ne remplace pas le type de script et le chemin nécessaires pour retrouver les bonnes adresses. Les interactions avec une fuite de certaines clés privées relèvent d’un risque technique supplémentaire à traiter dans un approfondissement.

## Approfondissements

- [[watch-only-wallet.fr|Observer sans pouvoir dépenser]].
- [[derivation-path.fr|Le chemin de dérivation]].
- [[descriptor-wallet.fr|Les portefeuilles à descripteurs]].

- [[secondary-bitcoin-btcpay-extended-public-key.fr|Recevoir avec une clé publique étendue dans BTCPay]].
- [[secondary-bitcoin-hardened-derivation.fr|La dérivation renforcée des clés]].
- [[secondary-bitcoin-non-hardened-derivation.fr|La dérivation publique des clés enfants]].

## Références

- PlanB cyp201 — Bitcoin Wallet Architecture.
- PlanB Extraction — 2026-05-23.
