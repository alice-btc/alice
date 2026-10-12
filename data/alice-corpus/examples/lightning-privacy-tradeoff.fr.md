---
type: "project_note"
id: "lightning-privacy-tradeoff"
title: "La confidentialité sur Lightning"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["Lightning Privacy Tradeoff"]
parent_ids: []
related_ids: ["lightning-liquidity-path", "lightning-service-provider", "secondary-bitcoin-onion-messaging", "secondary-bitcoin-privacy-by-omission", "secondary-lightning-blinded-paths", "secondary-lightning-lightning-gossip-protocol", "secondary-lightning-lightning-private-channel", "secondary-lightning-onion-routing"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB dev303 — Learning Rust with Bitcoin"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La confidentialité sur Lightning

## Questions couvertes

- Quelles informations un paiement Lightning peut-il révéler ?

## Réponse courte

Lightning réduit la publication de chaque paiement sur la chaîne, mais ne garantit pas l’anonymat. Les informations visibles dépendent du routage, du wallet et des services utilisés.

## Explication

Le routage onion limite ce que chaque intermédiaire apprend sur le trajet. D’autres informations peuvent néanmoins circuler, notamment des montants, des horaires ou des besoins de liquidité. Un fournisseur de services, un nœud hébergé ou une infrastructure de factures peut observer des éléments qui resteraient locaux avec une autre architecture.

Il faut analyser qui voit quoi. Détenir soi-même les clés répond à la question de la garde ; cela ne répond pas à toutes les questions de confidentialité. La protection contre un pair curieux peut également différer de celle contre un opérateur observant plusieurs endroits du parcours.

## Limites et confusions

Ne pas attribuer à tous les fournisseurs la même visibilité sans examiner leur fonctionnement. Le simple mot « cloud » ne prouve pas que le fournisseur voit chaque destination ; inversement, « non custodial » ne prouve pas qu’il ne voit rien.

Pour une réponse débutante, expliquer les acteurs et les données exposées. Les garanties détaillées doivent être rattachées à une implémentation et à sa version, pas généralisées à tout Lightning.

## Approfondissements

- [[lightning-liquidity-path.fr|Liquidité et chemins de paiement Lightning]] — Liquidité et chemins — comprendre le parcours
- [[lightning-service-provider.fr|Les fournisseurs de services Lightning]] — situer les services intermédiaires

- [[secondary-bitcoin-onion-messaging.fr|Les messages onion de Lightning]].
- [[secondary-bitcoin-privacy-by-omission.fr|La confidentialité par réduction des données publiées]].
- [[secondary-lightning-blinded-paths.fr|Les chemins aveuglés sur Lightning]].
- [[secondary-lightning-lightning-gossip-protocol.fr|La diffusion du graphe public Lightning]].
- [[secondary-lightning-lightning-private-channel.fr|Les canaux Lightning non annoncés]].
- [[secondary-lightning-onion-routing.fr|Le routage en oignon de Lightning]].

## Références

- PlanB dev303 — Learning Rust with Bitcoin (référence de la note source, non reconsultée directement pour cette adaptation).
