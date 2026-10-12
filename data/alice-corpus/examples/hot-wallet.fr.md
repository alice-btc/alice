---
type: "project_note"
id: "hot-wallet"
title: "Le portefeuille connecté"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["Hot Wallet"]
parent_ids: []
related_ids: ["cold-storage", "hardware-wallet", "threat-model", "secondary-bitcoin-btcpay-hot-wallet"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc102 — Getting your first bitcoins", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Le portefeuille connecté

## Questions couvertes

- Qu’est-ce qu’un hot wallet ?

## Réponse courte

Un hot wallet conserve les clés utilisables sur un appareil connecté à Internet. Il facilite les paiements fréquents, mais expose ces clés aux risques de cet environnement.

## Explication

Un portefeuille mobile ou de bureau peut remplir ce rôle. Sa sécurité dépend notamment du système, des applications installées, de la protection de l’accès et de la gestion des sauvegardes. Un logiciel malveillant ou un faux support peut viser le secret ou manipuler une opération.

Le choix se raisonne selon l’usage, les fonds concernés et les conséquences d’une compromission. Séparer les besoins de dépense quotidienne des besoins de conservation peut limiter l’exposition sans supprimer tous les risques.

## Limites et confusions

Une interface sur ordinateur n’est pas forcément un hot wallet si les signatures sont produites par un appareil séparé. Inversement, un appareil rarement utilisé n’est pas automatiquement un dispositif sûr de conservation hors ligne. « Hot » décrit l’exposition des clés ; « custodial » décrit qui les contrôle. Ces catégories répondent à des questions différentes.

## Approfondissements

- [[cold-storage.fr|La conservation hors ligne]].
- [[hardware-wallet.fr|Le rôle d’un appareil de signature]].
- [[threat-model.fr|Adapter la protection aux risques]].

- [[secondary-bitcoin-btcpay-hot-wallet.fr|Les clés privées sur un serveur BTCPay]].

## Références

- PlanB btc102 — Getting your first bitcoins.
- PlanB Extraction — 2026-05-23.
