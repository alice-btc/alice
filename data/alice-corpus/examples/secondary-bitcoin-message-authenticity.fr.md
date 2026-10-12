---
type: "project_note"
id: "secondary-bitcoin-message-authenticity"
title: "L’authenticité d’un message"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Message Authenticity"]
parent_ids: ["digital-signature", "encryption"]
related_ids: ["digital-signature", "encryption"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp302 — Modern Cryptography Fundamentals"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# L’authenticité d’un message

## Questions couvertes

- Que prouve réellement une signature sur un message ?

## Réponse courte

Authentifier un message permet de vérifier son lien avec la clé attendue. Une signature ou un MAC peut contribuer à cette vérification.

## Explication

- Elle peut être symétrique via MAC.
- Elle peut être asymétrique via signature numérique.
- Elle est distincte de la confidentialité.
- Elle est essentielle pour éviter l’injection ou l’usurpation de messages.

## Limites et confusions

La preuve porte sur la clé ; son association à une personne et sa non-compromission restent à établir.

## Approfondissements

- [[digital-signature.fr|La signature numérique]] pour revenir à la notion de base.
- [[encryption.fr|Chiffrement et signature]] pour revenir à la notion de base.

## Références

- PlanB cyp302 — Modern Cryptography Fundamentals
