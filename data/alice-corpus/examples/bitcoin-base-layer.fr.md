---
type: "project_note"
id: "bitcoin-base-layer"
title: "La couche de base de Bitcoin"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["fundamentals"]
aliases: ["Bitcoin Base Layer"]
parent_ids: []
related_ids: ["transaction-fees", "bitcoin-finality", "lightning-network"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://bitcoin.org/bitcoin.pdf", "https://developer.bitcoin.org/devguide/block_chain.html"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La couche de base de Bitcoin

## Questions couvertes

- Que veut dire payer on-chain ?

## Réponse courte

Payer sur la couche de base, ou « on-chain », signifie faire inscrire une transaction dans les blocs de Bitcoin. Les nœuds en vérifient les règles et les confirmations renforcent progressivement sa stabilité.

## Explication

L’espace disponible dans les blocs est limité. Les paiements entrent donc en concurrence pour cet espace, notamment par leur taux de frais. Le coût dépend de la taille virtuelle de la transaction et des conditions de demande, pas simplement du montant envoyé.

D’autres protocoles organisent des paiements en dehors de chaque inscription individuelle sur cette chaîne. Ils peuvent améliorer certains usages, mais ajoutent leurs propres conditions, dépendances et limites. La couche de base reste alors un point de règlement ou de sortie selon le protocole.

## Limites et confusions

Plus une transaction accumule de confirmations, plus le risque d’annulation devient faible. Aucun montant minimum d’usage n’est imposé par une règle réservant Bitcoin aux gros règlements. Le choix entre couches dépend des frais, des délais, des besoins et du modèle de confiance ; « hors chaîne » ne décrit pas à lui seul le niveau de sécurité.

## Approfondissements

- [[transaction-fees.fr|Les frais de transaction]].
- [[bitcoin-finality.fr|La finalité progressive]].
- [[lightning-network.fr|Comprendre Lightning]].

## Références

- [Référence publique conservée de la note source](https://bitcoin.org/bitcoin.pdf).
- [Référence publique conservée de la note source](https://developer.bitcoin.org/devguide/block_chain.html).
