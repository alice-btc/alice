---
type: "project_note"
id: "ark-fees-and-liquidity"
title: "Les frais et la liquidité d’Ark"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Ark et autres couches"]
aliases: ["Ark Fees and Liquidity"]
parent_ids: []
related_ids: ["ark-security-model", "ark-implementations-bark-arkade"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://second.tech/docs/learn/fees", "https://second.tech/docs/learn/liquidity"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les frais et la liquidité d’Ark

## Questions couvertes

- Quels coûts et contraintes faut-il comprendre avec Ark ?

## Réponse courte

Ark simplifie la gestion de liquidité côté utilisateur, mais ne fait pas disparaître son coût. Le serveur mobilise du capital pour certaines opérations, notamment le renouvellement ou les paiements vers d’autres systèmes.

## Explication

Lors d’un renouvellement, l’opérateur peut financer de nouveaux VTXO avant de récupérer les anciens. Une sortie coopérative ou un paiement Lightning peut aussi lui demander d’avancer des fonds. La durée de cette immobilisation contribue au coût du service.

Un paiement interne peut avoir un coût marginal faible, tandis qu’une sortie on-chain implique les frais de Bitcoin. Il faut donc distinguer les frais du serveur, le coût des transactions Bitcoin et les éventuels frais de routage Lightning. L’interface devrait montrer le devis de l’opération effectivement demandée.

## Limites et confusions

Un ancien barème n’est pas un tarif garanti. Les paramètres sont configurables selon l’opérateur, le type d’opération et le temps restant avant expiration. Cette fiche ne reprend pas les pourcentages historiques comme des tarifs actuels.

Attendre pour réduire certains frais ne doit pas conduire à manquer l’échéance d’un VTXO. L’économie d’un renouvellement et la marge nécessaire pour récupérer ses fonds sont 2 contraintes à examiner ensemble.

## Approfondissements

- [[ark-security-model.fr|Les hypothèses de sécurité d’Ark]] — comprendre le risque d’expiration
- [[ark-implementations-bark-arkade.fr|Ark, Bark et Arkade, comprendre les différences]] — Bark et Arkade — préciser le service concerné

## Références

- [Référence technique 1](https://second.tech/docs/learn/fees).
- [Référence technique 2](https://second.tech/docs/learn/liquidity).
