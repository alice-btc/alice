---
type: "project_note"
id: "timelock"
title: "Les conditions temporelles"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Timelock"]
parent_ids: []
related_ids: ["bitcoin-transaction-input", "lightning-network", "bitcoin-address-scripts"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB pro202 — Programming Bitcoin"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les conditions temporelles

## Questions couvertes

- Peut-on empêcher une dépense avant une certaine date ?

## Réponse courte

Un timelock empêche une transaction ou une dépense d’être acceptée avant une condition temporelle donnée. Il peut être lié à une hauteur de bloc ou à une mesure du temps définie par le protocole.

## Explication

Une condition absolue vise un seuil déterminé. Une condition relative impose un délai par rapport à un événement antérieur, selon le mécanisme employé. Ces possibilités servent notamment aux canaux et à des scénarios de récupération prévus à l’avance.

Le portefeuille et la transaction doivent respecter les paramètres correspondants. Tant que les conditions requises ne sont pas réunies, posséder une clé peut ne pas suffire à autoriser immédiatement la dépense.

## Limites et confusions

Un timelock ne déclenche pas automatiquement un paiement à une heure civile exacte. Atteindre le seuil rend une dépense possible selon les autres conditions ; il faut encore construire, diffuser et confirmer une transaction. Les délais de blocs restent variables. Il faut distinguer une primitive générale de Bitcoin des règles particulières d’un protocole comme Lightning ou Ark.

## Approfondissements

- [[bitcoin-transaction-input.fr|Les entrées d’une transaction]].
- [[lightning-network.fr|Comprendre Lightning]].
- [[bitcoin-address-scripts.fr|Adresses, scripts et conditions de dépense]].

## Références

- PlanB pro202 — Programming Bitcoin.
