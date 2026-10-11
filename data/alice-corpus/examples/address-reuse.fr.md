---
type: "project_note"
id: "address-reuse"
title: "La réutilisation des adresses"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Address Reuse"]
parent_ids: []
related_ids: ["hd-wallet", "silent-payments", "address-spoofing", "secondary-privacy-bip47-reusable-payment-codes"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc204 — Privacy on Bitcoin", "PlanB Extraction — 2026-05-24 — Glossary"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La réutilisation des adresses

## Questions couvertes

- Pourquoi éviter de réutiliser une adresse ?

## Réponse courte

Réutiliser une adresse pour plusieurs réceptions permet de relier facilement ces paiements au même identifiant. Cela peut révéler un historique à des personnes qui n’avaient connaissance que d’une interaction.

## Explication

Un client ou un donateur connaissant une adresse peut observer les autres transactions qui lui sont associées. Un portefeuille HD permet de créer de nouvelles adresses sans créer un nouveau secret de sauvegarde pour chacune.

La séparation des adresses limite ce regroupement immédiat. Des mécanismes de réception réutilisable, comme les Silent Payments, cherchent aussi à éviter de publier toujours la même destination on-chain, avec leurs propres contraintes de support.

## Limites et confusions

Une adresse nouvelle n’efface pas les autres liens. Dépenser ensemble plusieurs fonds ou transmettre des informations à un serveur peut encore révéler leur relation. Une ancienne adresse ne devient pas automatiquement invalide après usage ; la question est surtout la confidentialité. La rotation des adresses ne protège pas, à elle seule, contre une substitution dans le presse-papiers.

## Approfondissements

- [[hd-wallet.fr|Les portefeuilles déterministes]].
- [[silent-payments.fr|Comprendre les Silent Payments]].
- [[address-spoofing.fr|La substitution d’adresse]].

- [[secondary-privacy-bip47-reusable-payment-codes.fr|Les codes de paiement réutilisables BIP47]].

## Références

- PlanB btc204 — Privacy on Bitcoin.
- PlanB Extraction — 2026-05-24 — Glossary.
