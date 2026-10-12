---
type: "project_note"
id: "secondary-lightning-lightning-private-channel"
title: "Les canaux Lightning non annoncés"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["Lightning Private Channel"]
parent_ids: ["lightning-channel", "lightning-privacy-tradeoff"]
related_ids: ["lightning-channel", "lightning-privacy-tradeoff"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB lnp404 — Navigating Your Node with Terminal"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les canaux Lightning non annoncés

## Questions couvertes

- Les canaux Lightning non annoncés — quel mécanisme et quelles limites ?

## Réponse courte

Un canal Lightning non annoncé n’est pas diffusé comme canal public dans le graphe de routage. Cela réduit certaines informations publiées, sans garantir que le canal reste secret.

## Explication

- Le canal peut être utilisé pour envoyer ou recevoir selon les informations de routage disponibles.
- Des indications de route peuvent aider un payeur à atteindre le destinataire.
- L’absence d’annonce publique ne constitue pas une garantie d’anonymat.

## Limites et confusions

Non annoncé ne signifie pas invisible ni connu seulement des 2 pairs. Des indices de route, les paiements et l’analyse de chaîne peuvent révéler son existence.

## Approfondissements

- [[lightning-channel.fr|Les canaux Lightning]] pour replacer ce mécanisme dans son contexte.
- [[lightning-privacy-tradeoff.fr|La confidentialité sur Lightning]] pour replacer ce mécanisme dans son contexte.

## Références

- PlanB lnp404 — Navigating Your Node with Terminal
