---
type: "project_note"
id: "secondary-lightning-lightning-remote-wallet-connection"
title: "Relier une application à un nœud distant"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["Lightning Remote Wallet Connection"]
parent_ids: ["lightning-node-online-status", "threat-model"]
related_ids: ["lightning-node-online-status", "threat-model"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB lnp202 — Set up Your First Lightning Node"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Relier une application à un nœud distant

## Questions couvertes

- Relier une application à un nœud distant — quel mécanisme et quelles limites ?

## Réponse courte

Une connexion remote wallet permet d’utiliser une application mobile tout en s’appuyant sur son propre nœud Lightning distant.

## Explication

- L’objectif est d’avoir une UX mobile sans abandonner le contrôle du nœud.
- Les modes courants incluent Tor, VPN/Tailscale ou Nostr Wallet Connect.
- Chaque méthode a un modèle de sécurité et de fiabilité différent.
- Les secrets d’accès doivent être limités et protégés.

## Limites et confusions

L’application distante agit selon les droits accordés par le nœud ou le service. La méthode de connexion ne prouve pas à elle seule l’autogarde des fonds.

## Approfondissements

- [[lightning-node-online-status.fr|La disponibilité du nœud]] pour replacer ce mécanisme dans son contexte.
- [[threat-model.fr|Adapter la protection aux risques]] pour replacer ce mécanisme dans son contexte.

## Références

- PlanB lnp202 — Set up Your First Lightning Node
