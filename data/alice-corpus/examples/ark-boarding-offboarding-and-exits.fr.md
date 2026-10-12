---
type: "project_note"
id: "ark-boarding-offboarding-and-exits"
title: "Entrer et sortir d’Ark"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Ark et autres couches"]
aliases: ["Ark Boarding Offboarding and Exits"]
parent_ids: []
related_ids: ["ark-security-model", "ark-implementations-bark-arkade"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["Second, Ark boarding et Ark offboarding, documentation citée dans la note source", "Arkade, Ramps: Onboarding & Offboarding, documentation citée dans la note source"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Entrer et sortir d’Ark

## Questions couvertes

- Comment distinguer une sortie coopérative d’une sortie unilatérale ?

## Réponse courte

Entrer dans Ark, sortir avec l’opérateur et sortir sans sa coopération sont des opérations différentes. Elles n’ont ni les mêmes frais ni les mêmes délais ni les mêmes conditions.

## Explication

Le boarding apporte des bitcoins on-chain pour créer un VTXO. Le chemin exact dépend de l’implémentation et du wallet ; certaines interfaces utilisent aussi des services de swap. Recevoir un paiement Ark n’exige pas nécessairement de réaliser soi-même un boarding.

L’offboarding coopératif transforme le droit hors chaîne en paiement Bitcoin avec l’aide du serveur. Une sortie d’urgence utilise au contraire les transactions pré-signées et les délais prévus pour récupérer sans cette coopération. Elle peut nécessiter plusieurs publications successives et une gestion attentive des frais.

## Limites et confusions

Une sortie d’urgence n’est pas un retrait instantané gratuit. Sa faisabilité dépend du type de VTXO, des données conservées et de l’échéance. Chez Second, elle doit être entièrement confirmée avant expiration.

Le wallet doit distinguer une opération coopérative habituelle d’un recours d’urgence. Les procédures de Bark ne doivent pas être appliquées aveuglément à Arkade ou à une autre implémentation. Pour une opération concrète, consulter les indications de la version utilisée.

## Approfondissements

- [[ark-security-model.fr|Les hypothèses de sécurité d’Ark]] — identifier les conditions de récupération
- [[ark-implementations-bark-arkade.fr|Ark, Bark et Arkade, comprendre les différences]] — Bark et Arkade — comprendre les implémentations

## Références

- Second, Ark boarding et Ark offboarding, documentation citée dans la note source (référence de la note source, non reconsultée directement pour cette adaptation).
- Arkade, Ramps: Onboarding & Offboarding, documentation citée dans la note source (référence de la note source, non reconsultée directement pour cette adaptation).
