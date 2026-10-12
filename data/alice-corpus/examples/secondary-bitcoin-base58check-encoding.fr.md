---
type: "project_note"
id: "secondary-bitcoin-base58check-encoding"
title: "L’encodage Base58Check"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Base58Check Encoding"]
parent_ids: ["legacy-address", "bitcoin-address"]
related_ids: ["legacy-address", "bitcoin-address"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pro202 — Programming Bitcoin"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# L’encodage Base58Check

## Questions couvertes

- À quoi sert la somme de contrôle d’une adresse Bitcoin historique ?

## Réponse courte

Base58Check encode notamment des adresses historiques et des clés étendues avec un préfixe et une somme de contrôle.

## Explication

- Des informations de version et une somme de contrôle sont encodées avec la charge utile.
- La détection d’erreur aide à éviter certaines fautes de saisie mais ne remplace pas la vérification du destinataire sur le dispositif de signature.

## Limites et confusions

Le checksum détecte certaines erreurs de saisie ; il ne garantit pas que l'adresse appartient au bon destinataire.

## Approfondissements

- [[legacy-address.fr|Comparer les formats d’adresses Bitcoin]] pour revenir à la notion de base.
- [[bitcoin-address.fr|Comprendre une adresse Bitcoin]] pour revenir à la notion de base.

## Références

- PlanB pro202 — Programming Bitcoin
