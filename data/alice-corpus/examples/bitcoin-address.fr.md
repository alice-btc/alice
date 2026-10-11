---
type: "project_note"
id: "bitcoin-address"
title: "Comprendre une adresse Bitcoin"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Bitcoin Address"]
parent_ids: []
related_ids: ["legacy-address", "address-reuse", "address-spoofing", "bitcoin-address-scripts", "secondary-bitcoin-base58check-encoding", "secondary-bitcoin-confidential-address", "secondary-bitcoin-hash160"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Comprendre une adresse Bitcoin

## Questions couvertes

- Une adresse est-elle mon compte Bitcoin ?

## Réponse courte

Une adresse est une représentation pratique des conditions destinées à recevoir des bitcoins. Ce n’est ni un compte personnel global, ni une clé privée, ni tout le portefeuille.

## Explication

Le portefeuille peut produire de nombreuses adresses à partir de ses informations de clés. Un destinataire communique une adresse ; le payeur l’utilise pour construire une sortie de transaction. La dépense ultérieure devra respecter les conditions associées à cette sortie.

Les formats d’adresses ont évolué. Des préfixes différents correspondent à des familles de sorties différentes et à des besoins de compatibilité. Changer d’adresse de réception ne signifie donc pas nécessairement changer de portefeuille.

## Limites et confusions

Une adresse révèle des informations sur les transactions qui lui sont associées. La publier ou la réutiliser peut faciliter les rapprochements. Son format ne prouve pas l’identité de son propriétaire. Pour une opération avec un hardware wallet, l’adresse affichée sur l’appareil doit être comparée intégralement à une information fiable ; une simple ressemblance du début et de la fin ne suffit pas.

## Approfondissements

- [[legacy-address.fr|Comparer les formats d’adresses Bitcoin]].
- [[address-reuse.fr|La réutilisation des adresses]].
- [[address-spoofing.fr|La substitution d’adresse]].

- [[bitcoin-address-scripts.fr|Adresses, scripts et conditions de dépense]].
- [[secondary-bitcoin-base58check-encoding.fr|L’encodage Base58Check]].
- [[secondary-bitcoin-confidential-address.fr|Les adresses confidentielles de Liquid]].
- [[secondary-bitcoin-hash160.fr|La fonction HASH160]].

## Références

- PlanB cyp201 — Bitcoin Wallet Architecture.
- PlanB Extraction — 2026-05-23.
