---
type: "project_note"
id: "ark-vtxos"
title: "Les sorties virtuelles d’Ark"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Ark et autres couches"]
aliases: ["Ark VTXOs"]
parent_ids: []
related_ids: ["ark-implementations-bark-arkade", "ark-security-model"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://second.tech/docs/learn/exit", "https://second.tech/docs/learn/lifetime", "https://docs.arkadeos.com/learn/core-concepts/vtxo-lifecycle-and-liveness"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les sorties virtuelles d’Ark

## Questions couvertes

- Qu’est-ce qu’un VTXO ?

## Réponse courte

Un VTXO est une sortie virtuelle utilisée dans Ark. Il représente un droit sur des bitcoins à travers des transactions pré-signées, avec des conditions de paiement et de récupération propres à son type.

## Explication

Plusieurs utilisateurs peuvent partager une structure de transactions ancrée sur Bitcoin, tout en disposant de chemins de sortie individuels. Tant que le fonctionnement est coopératif, les paiements restent hors chaîne. Une sortie d’urgence publie les transactions nécessaires pour revenir à des UTXO Bitcoin.

Chez Second/Bark, la provenance distingue notamment les VTXO issus d’une entrée on-chain, d’un renouvellement et d’un paiement arkoor. Ces derniers ajoutent une hypothèse temporaire de non-collusion entre les précédents émetteurs et le serveur. Le nom VTXO ne suffit donc pas à déterminer toutes les garanties.

## Limites et confusions

Un VTXO a une échéance. Dans les mécanismes documentés, la récupération unilatérale doit aboutir à temps ; chez Second, elle doit être entièrement confirmée avant expiration. Les données de récupération et les frais nécessaires doivent être disponibles.

Il ne faut pas présenter le VTXO comme une sortie Bitcoin ordinaire déjà dépensable directement. Son historique, son ancrage et l’implémentation déterminent le chemin de récupération.

## Approfondissements

- [[ark-implementations-bark-arkade.fr|Ark, Bark et Arkade, comprendre les différences]] — Bark et Arkade — préciser les différences
- [[ark-security-model.fr|Les hypothèses de sécurité d’Ark]] — comprendre l’expiration et les risques

## Références

- [Référence technique 1](https://second.tech/docs/learn/exit).
- [Référence technique 2](https://second.tech/docs/learn/lifetime).
- [Référence technique 3](https://docs.arkadeos.com/learn/core-concepts/vtxo-lifecycle-and-liveness).
