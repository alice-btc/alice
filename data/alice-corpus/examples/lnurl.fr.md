---
type: "project_note"
id: "lnurl"
title: "Les liens LNURL"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["LNURL"]
parent_ids: []
related_ids: ["lightning-address", "lightning-invoice", "secondary-bitcoin-lnurl-auth", "secondary-bitcoin-wallet-as-identity"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB lnp201 — Lightning Network Theory"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les liens LNURL

## Questions couvertes

- À quoi sert LNURL ?

## Réponse courte

LNURL regroupe des protocoles qui facilitent certaines interactions Lightning à partir d’un lien ou d’un QR code. Selon le type de demande, il peut servir à payer, retirer des sats ou s’authentifier.

## Explication

LNURL-pay permet à un wallet de demander une facture à une destination réutilisable. LNURL-withdraw permet de présenter sa propre facture à un service qui propose un retrait. LNURL-auth sert à une authentification fondée sur des clés. Ces usages sont distincts même s’ils se présentent tous sous une forme facile à scanner.

La communication avec un service web apporte l’automatisation qui manquerait à une facture copiée manuellement. Elle s’ajoute au réseau Lightning plutôt que de remplacer son mécanisme de paiement.

## Limites et confusions

Un QR code LNURL n’est pas automatiquement une demande de paiement. Le portefeuille doit indiquer l’action demandée avant que l’utilisateur l’autorise. Scanner un code de retrait ne doit pas être interprété comme payer son émetteur.

La disponibilité du serveur et la confidentialité de l’interaction comptent. LNURL ne prouve ni la solvabilité du service ni le mode de garde des fonds. Le soutien de chaque variante dépend également du portefeuille utilisé.

## Approfondissements

- [[lightning-address.fr|Les adresses Lightning]] — voir un usage de LNURL-pay
- [[lightning-invoice.fr|Les factures Lightning]] — comprendre la facture employée pour le règlement

- [[secondary-bitcoin-lnurl-auth.fr|S’authentifier avec LNURL-AUTH]].
- [[secondary-bitcoin-wallet-as-identity.fr|Le portefeuille comme moyen d’authentification]].

## Références

- PlanB lnp201 — Lightning Network Theory (référence de la note source, non reconsultée directement pour cette adaptation).
