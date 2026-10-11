---
type: "project_note"
id: "secondary-privacy-kyc-bitcoin-acquisition"
title: "Les traces laissées par un achat avec identification"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["privacy"]
aliases: ["KYC Bitcoin Acquisition"]
parent_ids: ["kyc-data-leakage", "utxo-labeling"]
related_ids: ["kyc-data-leakage", "utxo-labeling"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB btc102 — Getting your first bitcoins", "PlanB min304 — Heat your home while mining bitcoins"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les traces laissées par un achat avec identification

## Questions couvertes

- Les traces laissées par un achat avec identification — quel mécanisme et quelles limites ?

## Réponse courte

L’acquisition KYC de bitcoin passe par un service qui vérifie l’identité de l’utilisateur. Elle simplifie souvent l’achat fiat, mais crée un lien durable entre identité, historique d’achat et potentielle détention.

## Explication

- Le KYC peut faciliter conformité, virements bancaires et volumes plus élevés.
- Il crée des données sensibles exposées aux fuites, réquisitions ou usages commerciaux.
- Retirer vers self-custody ne supprime pas l’historique KYC.
- Séparer les UTXO KYC/non-KYC demande labels et coin control.

## Limites et confusions

Retirer ses fonds ne supprime pas l’historique conservé par le service. Un achat sans collecte d’identité ne garantit pas non plus l’anonymat.

## Approfondissements

- [[kyc-data-leakage.fr|Les données d’identification exposées]] pour replacer ce mécanisme dans son contexte.
- [[utxo-labeling.fr|Étiqueter ses UTXO]] pour replacer ce mécanisme dans son contexte.

## Références

- PlanB btc102 — Getting your first bitcoins
- PlanB min304 — Heat your home while mining bitcoins
