---
type: "project_note"
id: "lightning-node-online-status"
title: "La disponibilité du nœud"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["Lightning Node Online Status"]
parent_ids: []
related_ids: ["watchtower", "lightning-service-provider", "secondary-bitcoin-lightning-offline-receiving-problem", "secondary-lightning-lightning-remote-wallet-connection", "secondary-lightning-macaroon"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB lnp404 — Navigating Your Node with Terminal"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La disponibilité du nœud

## Questions couvertes

- Dois-je être en ligne pour utiliser Lightning ?

## Réponse courte

Un nœud Lightning doit être joignable pour participer normalement aux paiements et au routage. Sa disponibilité compte aussi pour surveiller les événements qui concernent ses canaux.

## Explication

Un opérateur de routage fournit un service aux autres participants. Les interruptions rendent ses chemins moins fiables et peuvent provoquer des échecs ou des tentatives supplémentaires. Le suivi du processus, de la connexion et de la synchronisation aide à distinguer un nœud allumé d’un nœud réellement opérationnel.

Pour un utilisateur mobile, une partie de cette disponibilité peut être organisée par l’architecture du wallet ou par un fournisseur. Il faut comprendre qui reste connecté et quelles informations ou fonctions lui sont confiées.

## Limites et confusions

Être brièvement hors ligne ne signifie pas que tous les fonds disparaissent. Les conséquences dépendent des paiements en cours, des délais du canal et des protections disponibles. Une indisponibilité prolongée peut cependant empêcher d’agir dans une fenêtre importante.

Une watchtower couvre certaines tentatives de triche lors du règlement ; elle n’effectue pas tout le travail du nœud. De même, un LSP peut améliorer l’accès aux paiements sans supprimer toutes les dépendances réseau.

## Approfondissements

- [[watchtower.fr|Le rôle d’une watchtower]] — comprendre la surveillance déléguée
- [[lightning-service-provider.fr|Les fournisseurs de services Lightning]] — voir les fonctions prises en charge par un service

- [[secondary-bitcoin-lightning-offline-receiving-problem.fr|Recevoir sur Lightning en étant hors ligne]].
- [[secondary-lightning-lightning-remote-wallet-connection.fr|Relier une application à un nœud distant]].
- [[secondary-lightning-macaroon.fr|Les jetons d’accès macaroon de LND]].

## Références

- PlanB lnp404 — Navigating Your Node with Terminal (référence de la note source, non reconsultée directement pour cette adaptation).
