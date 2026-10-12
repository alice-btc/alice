---
type: "project_note"
id: "cold-storage"
title: "La conservation hors ligne"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["Cold Storage"]
parent_ids: []
related_ids: ["watch-only-wallet", "partially-signed-bitcoin-transaction", "secure-backups", "secondary-bitcoin-paper-wallet"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc102 — Getting your first bitcoins", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La conservation hors ligne

## Questions couvertes

- Que signifie conserver ses clés hors ligne ?

## Réponse courte

La conservation hors ligne cherche à isoler les clés de signature des environnements connectés. Elle vise surtout à réduire l’exposition aux attaques à distance.

## Explication

Un appareil de signature dédié est une possibilité ; d’autres organisations séparent aussi préparation et signature. Les informations publiques peuvent rester dans un portefeuille de consultation tandis que le secret sert uniquement lors d’une autorisation.

La sécurité dépend de toute la chaîne. La génération des clés, leur sauvegarde, le transfert des données à signer et la vérification de la destination doivent être cohérents. Un secret initialement exposé ne redevient pas inconnu des attaquants simplement parce que l’appareil est ensuite déconnecté.

## Limites et confusions

Hors ligne ne signifie pas invulnérable. Perte, destruction, erreur de récupération et accès physique restent possibles. Une organisation trop compliquée peut créer un risque de blocage supérieur à celui qu’elle cherche à réduire. Les termes cold storage et hardware wallet se recouvrent partiellement, mais désignent respectivement une organisation de conservation et une catégorie d’appareils.

## Approfondissements

- [[watch-only-wallet.fr|Observer sans pouvoir dépenser]].
- [[partially-signed-bitcoin-transaction.fr|Préparer et signer une transaction avec PSBT]].
- [[secure-backups.fr|Les risques qui menacent une sauvegarde]].

- [[secondary-bitcoin-paper-wallet.fr|Les anciens portefeuilles papier]].

## Références

- PlanB btc102 — Getting your first bitcoins.
- PlanB Extraction — 2026-05-23.
