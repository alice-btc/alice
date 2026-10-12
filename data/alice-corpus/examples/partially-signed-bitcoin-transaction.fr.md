---
type: "project_note"
id: "partially-signed-bitcoin-transaction"
title: "Préparer et signer une transaction avec PSBT"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Partially Signed Bitcoin Transaction"]
parent_ids: []
related_ids: ["hardware-wallet", "multisig", "cold-storage"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB pos305 — Mastering BTC Pay Server", "PlanB Extraction — 2026-05-23 — csv404"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Préparer et signer une transaction avec PSBT

## Questions couvertes

- Comment séparer préparation et signature ?

## Réponse courte

PSBT est un format d’échange pour préparer et signer une transaction Bitcoin entre plusieurs outils. Il permet de séparer la construction, la vérification, la signature et la diffusion.

## Explication

Un ordinateur peut préparer la transaction avec ses entrées, ses sorties et les informations utiles. Un appareil de signature reçoit ensuite ces éléments, vérifie ce qu’il peut en comprendre et ajoute les signatures autorisées. Une fois les signatures nécessaires réunies, la transaction peut être finalisée puis diffusée.

Ce modèle est utile pour un hardware wallet, une conservation hors ligne ou une configuration multisig. Les clés privées n’ont pas besoin d’être transmises à l’ordinateur qui coordonne le paiement.

## Limites et confusions

Une PSBT peut contenir des informations sensibles pour la confidentialité. Son format ne garantit ni la bonne destination ni l’absence de logiciel malveillant. Le signataire doit contrôler ce qu’il autorise sur son interface de confiance. « Partiellement signée » désigne le format et le processus ; le fichier peut aussi circuler avant toute signature.

## Approfondissements

- [[hardware-wallet.fr|Le rôle d’un appareil de signature]].
- [[multisig.fr|La signature multiple]].
- [[cold-storage.fr|La conservation hors ligne]].

## Références

- PlanB pos305 — Mastering BTC Pay Server.
- PlanB Extraction — 2026-05-23 — csv404.
