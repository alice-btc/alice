---
type: "project_note"
id: "bitcoin-pseudonymity"
title: "Pseudonyme ne veut pas dire anonyme"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Bitcoin Pseudonymity"]
parent_ids: []
related_ids: ["blockchain-privacy-leaks", "bitcoin-chain-analysis", "non-blockchain-privacy-leaks", "secondary-bitcoin-cypherpunk-manifesto", "secondary-bitcoin-no-kyc-mining-rewards", "secondary-bitcoin-virgin-bitcoin"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc303 — Bitcoin Development Philosophy"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Pseudonyme ne veut pas dire anonyme

## Questions couvertes

- Mes paiements Bitcoin sont-ils anonymes ?

## Réponse courte

Bitcoin est pseudonyme, pas anonyme par défaut. La chaîne ne demande pas un nom civil pour chaque paiement, mais ses données publiques peuvent être reliées à une personne par d’autres informations.

## Explication

Une adresse agit comme un identifiant cryptographique. Plusieurs adresses peuvent être créées par le même portefeuille. Les montants et les relations entre transactions restent cependant observables dans le registre.

Un marchand connaît parfois son client ; une plateforme peut associer un retrait à un compte identifié. La réutilisation d’une adresse ou certains regroupements de fonds peuvent étendre ces liens à d’autres transactions. Les données recueillies à différents moments peuvent être combinées.

## Limites et confusions

Une nouvelle adresse ne garantit pas de repartir avec un historique impossible à relier. À l’inverse, une hypothèse d’analyse ne prouve pas toujours l’identité d’un utilisateur. Il faut distinguer les faits visibles, les données apportées par un tiers et les déductions. La confidentialité dépend d’un ensemble de pratiques, des outils et des informations déjà divulguées.

## Approfondissements

- [[blockchain-privacy-leaks.fr|Les informations publiques sur la chaîne]].
- [[bitcoin-chain-analysis.fr|L’analyse de chaîne]].
- [[non-blockchain-privacy-leaks.fr|Les fuites hors de la blockchain]].

- [[secondary-bitcoin-cypherpunk-manifesto.fr|Le manifeste cypherpunk]].
- [[secondary-bitcoin-no-kyc-mining-rewards.fr|Recevoir des récompenses sans KYC]].
- [[secondary-bitcoin-virgin-bitcoin.fr|Les bitcoins fraîchement minés]].

## Références

- PlanB btc303 — Bitcoin Development Philosophy.
