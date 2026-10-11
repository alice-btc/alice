---
type: "project_note"
id: "silent-payments"
title: "Comprendre les Silent Payments"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Silent Payments"]
parent_ids: []
related_ids: ["address-reuse", "taproot", "bitcoin-pseudonymity", "secondary-privacy-bip47-reusable-payment-codes"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/bitcoin/bips/blob/master/bip-0352.mediawiki"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Comprendre les Silent Payments

## Questions couvertes

- À quoi sert une adresse de paiement silencieux ?

## Réponse courte

Les Silent Payments permettent de publier une instruction de réception réutilisable tout en obtenant des sorties on-chain différentes selon les paiements. Le mécanisme réduit le lien visible avec une adresse de réception statique.

## Explication

Le payeur utilise des informations du destinataire et des données liées aux entrées pour construire la destination du paiement. Le destinataire doit ensuite détecter ses sorties en examinant les données nécessaires de la chaîne. Le protocole distingue notamment les besoins de scan et de dépense.

Cette organisation peut être utile pour une réception publique répétée. Elle n’exige pas une transaction de notification dédiée et utilise des sorties Taproot. Elle ajoute cependant du travail de détection et des contraintes de logiciel.

## Limites et confusions

Le statut de la spécification BIP352 ne prouve pas que chaque portefeuille sait envoyer, recevoir et restaurer ces paiements. Ces fonctions doivent être vérifiées séparément. Les montants restent publics et d’autres liens peuvent exister. Les limites des transactions collaboratives et les détails de scan relèvent d’un approfondissement adapté au logiciel.

## Approfondissements

- [[address-reuse.fr|La réutilisation des adresses]].
- [[taproot.fr|Les adresses bc1p et Taproot]].
- [[bitcoin-pseudonymity.fr|Pseudonyme ne veut pas dire anonyme]].

- [[secondary-privacy-bip47-reusable-payment-codes.fr|Les codes de paiement réutilisables BIP47]].

## Références

- [Référence publique conservée de la note source](https://github.com/bitcoin/bips/blob/master/bip-0352.mediawiki).
