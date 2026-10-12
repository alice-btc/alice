---
type: "project_note"
id: "bitcoin-layered-architecture"
title: "Les couches de Bitcoin"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Ark et autres couches"]
aliases: ["Bitcoin Layered Architecture"]
parent_ids: []
related_ids: ["ark-implementations-bark-arkade", "spark-trust-and-exits", "fedimint-custody-and-privacy", "secondary-economics-layered-money"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc102 — Getting your first bitcoins"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les couches de Bitcoin

## Questions couvertes

- Pourquoi construire des systèmes au-dessus de Bitcoin ?

## Réponse courte

Bitcoin peut servir de base à plusieurs systèmes de paiement et d’usage. Ces couches apportent des fonctions différentes, avec leurs propres conditions de sécurité, de garde et de sortie.

## Explication

La chaîne Bitcoin publie et vérifie les transactions selon les règles communes du réseau. Lightning organise des paiements à travers des canaux. Ark regroupe des droits de sortie et des paiements hors chaîne avec un opérateur. Une sidechain comme Liquid possède sa propre chaîne et un mécanisme de conversion. Un système d’ecash utilise des jetons émis par un mint.

La bonne comparaison commence par des questions concrètes. Qui contrôle les clés ? Qui garde les BTC ? Peut-on sortir sans coopération, dans quels délais et à quel coût ? Quelles informations deviennent publiques ou visibles à un opérateur ?

## Limites et confusions

Le mot « couche » ne garantit pas l’héritage intégral de la sécurité Bitcoin. Une créance gérée par un tiers n’est pas équivalente à un UTXO dont on contrôle les conditions de dépense.

Une interface similaire peut cacher des architectures différentes. Il faut expliquer les garanties de la solution réellement utilisée, sans déduire son modèle du seul fait qu’elle accepte des paiements en sats.

## Approfondissements

- [[ark-implementations-bark-arkade.fr|Ark, Bark et Arkade, comprendre les différences]] — Bark et Arkade — distinguer les implémentations
- [[spark-trust-and-exits.fr|Spark, opérateurs et sorties vers Bitcoin]] — Spark — préciser confiance et sortie
- [[fedimint-custody-and-privacy.fr|Fedimint, garde fédérée et confidentialité]] — Fedimint — distinguer fédération et garde

- [[secondary-economics-layered-money.fr|Les couches de créances monétaires]].

## Références

- PlanB btc102 — Getting your first bitcoins (référence de la note source, non reconsultée directement pour cette adaptation).
