---
type: "project_note"
id: "bolt12-offers"
title: "Les offres BOLT12"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["BOLT12 Offers"]
parent_ids: []
related_ids: ["lightning-invoice", "lightning-privacy-tradeoff", "secondary-bitcoin-onion-messaging", "secondary-lightning-blinded-paths"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/lightning/bolts/blob/master/12-offer-encoding.md"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les offres BOLT12

## Questions couvertes

- Que change une offre réutilisable ?

## Réponse courte

Une offre BOLT12 est une information de paiement réutilisable à partir de laquelle un portefeuille compatible peut demander une nouvelle facture Lightning. L’offre et la facture ne sont pas le même objet.

## Explication

Le payeur part de l’offre, envoie une demande de facture, reçoit une facture propre à l’opération, puis la règle. Ce dialogue peut passer par les messages onion de Lightning plutôt que par un serveur HTTP dédié.

Les mécanismes de chemins masqués peuvent limiter certaines informations révélées sur le destinataire. Le but est de rendre la réception plus pratique tout en améliorant certains aspects de confidentialité. Le même support affiché par un marchand peut ainsi servir à plusieurs demandes, sans transformer une facture individuelle en facture éternellement réutilisable.

## Limites et confusions

La présence du format dans la spécification ne signifie pas que tous les wallets savent créer ou payer une offre. Pour un usage concret, vérifier les fonctions et la version du logiciel.

Une amélioration de confidentialité n’est pas une garantie d’anonymat. Le routage, le service employé et les informations échangées avec le marchand peuvent encore révéler des données. Une offre ne garantit pas non plus qu’une route liquide sera disponible au moment de payer.

## Approfondissements

- [[lightning-invoice.fr|Les factures Lightning]] — comparer avec une facture classique
- [[lightning-privacy-tradeoff.fr|La confidentialité sur Lightning]] — examiner les informations exposées

- [[secondary-bitcoin-onion-messaging.fr|Les messages onion de Lightning]].
- [[secondary-lightning-blinded-paths.fr|Les chemins aveuglés sur Lightning]].

## Références

- [Spécification BOLT 12](https://github.com/lightning/bolts/blob/master/12-offer-encoding.md).
