---
type: "project_note"
id: "custodial-lightning-wallet"
title: "La garde sur Lightning"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["Custodial Lightning Wallet"]
parent_ids: []
related_ids: ["lightning-service-provider", "spark-trust-and-exits", "secondary-lightning-nostr-wallet-connect"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB lnp202 — Set up Your First Lightning Node"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La garde sur Lightning

## Questions couvertes

- Qui détient les clés selon le service utilisé ?

## Réponse courte

Un wallet Lightning custodial affiche un solde tenu par un opérateur qui contrôle les clés et les canaux. L’utilisateur dépend de cet opérateur pour exécuter ses paiements ou récupérer ses bitcoins.

## Explication

Le service s’occupe de la liquidité, de la disponibilité et du routage. L’expérience peut donc être simple, mais le solde correspond à une créance ou à une écriture chez ce service. Un paiement Lightning reçu par l’opérateur ne donne pas automatiquement à l’utilisateur le contrôle de bitcoins on-chain.

Pour identifier le modèle, examiner qui signe les dépenses et comment les fonds seraient récupérés si l’entreprise cessait de répondre. Le nom de l’application, la présence d’un QR code ou l’emploi du mot « Lightning » ne suffit pas.

## Limites et confusions

L’opérateur peut être indisponible, devenir insolvable ou bloquer un compte. L’autonomie est différente de celle d’un wallet dont l’utilisateur contrôle les clés et les mécanismes de sortie.

Une même application peut proposer plusieurs modes de garde selon ses versions ou les régions. Il faut vérifier le mode réellement activé, sans classer définitivement une marque. Un LSP qui aide un wallet autonome n’est pas automatiquement le gardien de ses fonds.

## Approfondissements

- [[lightning-service-provider.fr|Les fournisseurs de services Lightning]] — distinguer service de liquidité et garde
- [[spark-trust-and-exits.fr|Spark, opérateurs et sorties vers Bitcoin]] — Spark — examiner les hypothèses d’un autre modèle

- [[secondary-lightning-nostr-wallet-connect.fr|Les connexions Nostr Wallet Connect]].

## Références

- PlanB lnp202 — Set up Your First Lightning Node (référence de la note source, non reconsultée directement pour cette adaptation).
