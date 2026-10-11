---
type: "project_note"
id: "bitcoin-censorship-resistance"
title: "La résistance à la censure"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["fundamentals"]
aliases: ["Bitcoin Censorship Resistance"]
parent_ids: []
related_ids: ["bitcoin-decentralization", "bitcoin-permissionlessness", "bitcoin-mempool-policy"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc303 — Bitcoin Development Philosophy"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La résistance à la censure

## Questions couvertes

- Un paiement Bitcoin peut-il être bloqué ?

## Réponse courte

La résistance à la censure rend difficile l’exclusion durable d’un paiement valide par une autorité unique. Elle ne signifie pas qu’aucun participant ne peut refuser ou retarder une transaction.

## Explication

Un mineur choisit le contenu de ses blocs et peut omettre un paiement. Si d’autres mineurs restent disposés à l’inclure, ce refus ne suffit pas à bloquer définitivement la transaction. De même, un utilisateur n’est pas obligé de dépendre d’un seul service pour accéder au réseau.

La diversité des mineurs, des nœuds et des voies d’accès limite les points de contrôle. La validation indépendante permet aussi de refuser un bloc qui violerait les règles, même s’il provient d’un acteur puissant.

## Limites et confusions

Une plateforme peut bloquer un retrait ou refuser une adresse ; cela ne prouve pas que le protocole interdit cette adresse. Inversement, une forte concentration du minage ou des accès peut fragiliser cette résistance. Les frais, les règles locales et les conditions de connexion peuvent retarder une transaction sans constituer une censure ciblée.

## Approfondissements

- [[bitcoin-decentralization.fr|La décentralisation]].
- [[bitcoin-permissionlessness.fr|Un réseau sans autorisation préalable]].
- [[bitcoin-mempool-policy.fr|Règles locales et consensus]].

## Références

- PlanB btc303 — Bitcoin Development Philosophy.
