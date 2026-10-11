---
type: "project_note"
id: "ark-security-model"
title: "Les hypothèses de sécurité d’Ark"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Ark et autres couches"]
aliases: ["Ark Security Model"]
parent_ids: []
related_ids: ["ark-implementations-bark-arkade", "ark-boarding-offboarding-and-exits"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://second.tech/docs/learn/lifetime", "https://second.tech/docs/learn/exit"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les hypothèses de sécurité d’Ark

## Questions couvertes

- De qui dépend-on lorsqu’on utilise Ark ?

## Réponse courte

Ark combine une voie normale coopérative avec des mécanismes de sortie vers Bitcoin. La possibilité de sortir seul dépend du VTXO, de son échéance, des données disponibles et de l’implémentation.

## Explication

Détenir les clés est nécessaire, mais ne résume pas toute la sécurité. Il faut aussi conserver les transactions de récupération et pouvoir payer leur publication. Chez Second, une sortie doit être entièrement confirmée avant l’expiration du VTXO. Lancer la procédure juste avant l’échéance ne suffit donc pas.

Après expiration, l’utilisateur ne peut plus récupérer seul les fonds et dépend de la coopération de l’opérateur. Une perte devient possible si cette coopération manque. Le wallet doit renouveler les VTXO à temps. Les paiements arkoor ajoutent temporairement une hypothèse de non-collusion qui doit être distinguée de ce risque d’expiration.

## Limites et confusions

Une sortie massive peut rendre les frais élevés, surtout pour de petits montants ou des chemins longs. La sortie théoriquement disponible n’est pas nécessairement économique dans toutes les conditions.

Les mécanismes de Second/Bark et d’Arkade ne sont pas identiques. Les dispositifs matériels ou de signature d’une implémentation ne doivent pas être présentés comme des garanties communes à tout Ark.

## Approfondissements

- [[ark-implementations-bark-arkade.fr|Ark, Bark et Arkade, comprendre les différences]] — Bark et Arkade — comparer les hypothèses
- [[ark-boarding-offboarding-and-exits.fr|Entrer et sortir d’Ark]] — comprendre les différentes sorties

## Références

- [Second, durée de vie des VTXO](https://second.tech/docs/learn/lifetime).
- [Second, sorties d’urgence et conditions de confirmation](https://second.tech/docs/learn/exit).
