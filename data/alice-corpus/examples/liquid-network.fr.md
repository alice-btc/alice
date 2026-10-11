---
type: "project_note"
id: "liquid-network"
title: "Comprendre Liquid"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Ark et autres couches"]
aliases: ["Liquid Network"]
parent_ids: []
related_ids: ["sidechains", "counterparty-risk", "secondary-bitcoin-confidential-address", "secondary-bitcoin-confidential-transactions", "secondary-bitcoin-cryptographic-commitment", "secondary-bitcoin-pedersen-commitment"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://blog.liquid.net/liquid-network-security-incident-assessment/"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Comprendre Liquid

## Questions couvertes

- Quelles différences entre Liquid et Bitcoin ?

## Réponse courte

Liquid est une sidechain fédérée liée à Bitcoin. Elle utilise notamment L-BTC pour représenter des bitcoins et permet d’autres actifs, avec une sécurité et un mécanisme de sortie différents de Bitcoin on-chain.

## Explication

Les transactions sont traitées par l’architecture de la sidechain et sa fédération. Les fonctions de confidentialité peuvent masquer certains montants et types d’actifs ; elles ne rendent pas toutes les informations invisibles. La reconversion de L-BTC dépend du mécanisme de peg et de ses acteurs.

Le rapport de Blockstream publié sur le blog Liquid le 2026-09-25 décrit un incident du 2026-09-06. Une faille d’Elements a permis de créer environ 4 000 L-BTC sans contrepartie, puis de retirer les BTC correspondants. Le bilan rapporte 3 400 BTC rendus et environ 602 BTC restant à récupérer.

## Limites et confusions

Cet incident n’est pas une création de BTC sur Bitcoin. Il illustre un risque du logiciel de sidechain et de sa conversion. Le bilan émane de l’organisation impliquée.

Les chiffres décrivent le rapport daté, pas un état en temps réel. La disponibilité actuelle des sorties, le solde récupéré et les conditions de conversion doivent être revérifiés avant une réponse opérationnelle. Le correctif logiciel et le rétablissement des retraits sont des questions distinctes.

## Approfondissements

- [[sidechains.fr|Les chaînes latérales]] — comprendre les hypothèses du peg
- [[counterparty-risk.fr|Le risque de contrepartie]] — identifier les dépendances de conversion

- [[secondary-bitcoin-confidential-address.fr|Les adresses confidentielles de Liquid]].
- [[secondary-bitcoin-confidential-transactions.fr|Les transactions confidentielles]].
- [[secondary-bitcoin-cryptographic-commitment.fr|Les engagements cryptographiques]].
- [[secondary-bitcoin-pedersen-commitment.fr|Les engagements de Pedersen]].

## Références

- [Blockstream, Liquid Network Security Incident Assessment, 2026-09-25](https://blog.liquid.net/liquid-network-security-incident-assessment/).
