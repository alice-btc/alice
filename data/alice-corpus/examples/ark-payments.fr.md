---
type: "project_note"
id: "ark-payments"
title: "Les paiements avec Ark"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Ark et autres couches"]
aliases: ["Ark Payments"]
parent_ids: []
related_ids: ["ark-implementations-bark-arkade", "ark-security-model"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://second.tech/docs/learn/payments"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les paiements avec Ark

## Questions couvertes

- Comment situer un paiement Ark par rapport à un paiement on-chain ?

## Réponse courte

Ark permet des paiements hors chaîne sans demander à chaque utilisateur de gérer des canaux Lightning. Chez Second/Bark, les paiements arkoor créent rapidement de nouveaux VTXO à partir d’une structure existante.

## Explication

Le paiement peut laisser une partie en monnaie rendue à l’émetteur et attribuer un nouveau droit au destinataire. Selon le wallet, celui-ci peut recevoir sans être connecté au même moment. Le serveur coopère au fonctionnement normal.

Un VTXO reçu par arkoor comporte une hypothèse de non-collusion entre les anciens émetteurs et le serveur. Le renouvellement dans un round permet de revenir au modèle standard décrit par l’implémentation. Ce compromis explique pourquoi un paiement rapide et une sortie unilatérale ne doivent pas être confondus avec une garantie sans aucune hypothèse.

## Limites et confusions

La réputation d’un opérateur et ses revenus attendus peuvent décourager la triche. Ils ne constituent pas une garantie cryptographique contre la collusion.

L’absence de gestion de canaux côté utilisateur ne rend pas tous les coûts nuls. Les renouvellements, les sorties et certaines connexions à Lightning mobilisent de la liquidité et des frais. Les politiques du wallet et les échéances des VTXO doivent rester visibles.

## Approfondissements

- [[ark-implementations-bark-arkade.fr|Ark, Bark et Arkade, comprendre les différences]] — Bark et Arkade — voir le périmètre des mécanismes
- [[ark-security-model.fr|Les hypothèses de sécurité d’Ark]] — examiner les hypothèses et recours

## Références

- [Référence technique 1](https://second.tech/docs/learn/payments).
