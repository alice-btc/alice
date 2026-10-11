---
type: "project_note"
id: "secondary-lightning-nostr-wallet-connect"
title: "Les connexions Nostr Wallet Connect"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["Nostr Wallet Connect"]
parent_ids: ["lightning-network", "custodial-lightning-wallet"]
related_ids: ["lightning-network", "custodial-lightning-wallet"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["https://github.com/nostr-protocol/nips/blob/master/47.md", "PlanB lnp202 — Set up Your First Lightning Node"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les connexions Nostr Wallet Connect

## Questions couvertes

- Les connexions Nostr Wallet Connect — quel mécanisme et quelles limites ?

## Réponse courte

Nostr Wallet Connect permet à une application d’envoyer des demandes chiffrées à un portefeuille via des relais Nostr. Le portefeuille exécute les opérations autorisées et renvoie ses réponses.

## Explication

- Les messages sont chiffrés entre les parties ; ce ne sont pas les relais eux-mêmes qui constituent une garantie de garde.
- L’URI de connexion comporte un secret d’accès à protéger.
- Le protocole évite d’exposer directement une API de nœud à chaque application.
- La connexion ne remplace ni les sauvegardes ni l’examen des droits accordés.

## Limites et confusions

NWC peut connecter un service custodial ou un nœud personnel. Les permissions et limites effectives dépendent du wallet ; les relais peuvent observer des métadonnées.

## Approfondissements

- [[lightning-network.fr|Comprendre Lightning]] pour replacer ce mécanisme dans son contexte.
- [[custodial-lightning-wallet.fr|La garde sur Lightning]] pour replacer ce mécanisme dans son contexte.

## Références

- [https://github.com/nostr-protocol/nips/blob/master/47.md](https://github.com/nostr-protocol/nips/blob/master/47.md)
- PlanB lnp202 — Set up Your First Lightning Node
