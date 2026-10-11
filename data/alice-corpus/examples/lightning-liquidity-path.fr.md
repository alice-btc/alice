---
type: "project_note"
id: "lightning-liquidity-path"
title: "Liquidité et chemins de paiement Lightning"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["liquidité entrante", "liquidité sortante", "route"]
parent_ids: ["lightning-network"]
related_ids: ["lightning-splicing"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/lightning/bolts/blob/master/02-peer-protocol.md", "https://github.com/lightning/bolts/blob/master/07-routing-gossip.md", "https://docs.corelightning.org/reference/listpeerchannels", "https://docs.lightning.engineering/the-lightning-network/multihop-payments/hash-time-lock-contract-htlc"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# Liquidité et chemins de paiement Lightning

## Questions couvertes

- Pourquoi un paiement échoue-t-il alors que j’ai assez de sats ?
- Pourquoi la capacité totale ne suffit-elle pas ?

## Réponse courte

Un paiement exige de la liquidité utilisable dans le bon sens, sur 1 ou plusieurs chemins selon le mode de paiement. Un solde total suffisant ne garantit pas que ce chemin existe.

## Explication

Pour envoyer, des fonds doivent pouvoir partir de ton côté. Pour recevoir, le pair qui partage un canal avec le portefeuille doit pouvoir transférer des fonds de son côté vers ce portefeuille. Cette possibilité constitue la liquidité entrante. La part détenue par le pair ne correspond pas nécessairement au montant entièrement recevable, car les réserves et limites du canal interviennent aussi. Chaque étape ajoute ses propres contraintes, dont les frais et les limites acceptées. Les informations publiques du réseau ne révèlent pas tous les soldes exacts des canaux.

Il faut distinguer le montant total du canal, la part qui revient à chaque participant et le montant actuellement envoyable. La réserve du canal impose de conserver un minimum de sa part dans le canal, pour garder des fonds exposés à une pénalité en cas de publication d’un ancien état révoqué. Elle peut donc réduire le montant envoyable sans retirer ces fonds de la part du participant. Les paiements en cours, les limites de HTLC et certaines provisions pour frais peuvent également intervenir.

Core Lightning fournit des indicateurs séparés. `total_msat` représente le total du canal ; `to_us_msat` représente la part qui nous revient ; `spendable_msat` estime le montant envoyable. Ce dernier reste une estimation, notamment parce que les frais et l’état des paiements peuvent changer. Une interface peut afficher un solde brut, un montant disponible ou plusieurs indicateurs. Il ne faut pas déduire une réserve une seconde fois si elle est déjà prise en compte dans le montant affiché.

## Limites et confusions

Un échec ne prouve pas une perte de fonds ni un manque de liquidité unique. Il peut aussi venir d’une facture expirée ou d’un participant indisponible. Un paiement peut aussi rester en attente, avec des fonds temporairement engagés dans des HTLC. Ils peuvent être libérés après un échec ou récupérés par la procédure prévue après expiration, éventuellement avec une fermeture et un règlement on-chain. La durée dépend des échéances et de l’état du canal ; attendre ne signifie pas que les fonds sont perdus. Le diagnostic doit partir des informations réellement connues.

La réserve n’est pas une confiscation ni un montant à transférer au partenaire. À la fermeture, le montant récupéré dépend notamment du dernier état valide, des paiements en cours, des frais et du type de fermeture ; les délais éventuels sont une autre question. Le montant envoyable par Lightning et le montant récupérable on-chain ne sont donc pas des indicateurs interchangeables. Cette fiche ne présume pas ce qu’un wallet particulier affiche et ne présente pas un pourcentage de réserve comme une règle universelle.

## Approfondissements

- [[lightning-splicing.fr|Modifier les fonds d’un canal avec le splicing]] (lightning-splicing) pour approfondir l’ajout ou le retrait de fonds du canal.
- [[lightning-network.fr|Comprendre Lightning]] (lightning-network) pour revenir aux canaux et au rôle de Lightning.

## Références

- [BOLT 2, protocole des canaux](https://github.com/lightning/bolts/blob/master/02-peer-protocol.md).
- [BOLT 7, informations de routage](https://github.com/lightning/bolts/blob/master/07-routing-gossip.md).
- [Core Lightning, indicateurs de part locale, réserve et montant envoyable](https://docs.corelightning.org/reference/listpeerchannels).

- [Lightning Labs, HTLC, expiration et fonds en attente](https://docs.lightning.engineering/the-lightning-network/multihop-payments/hash-time-lock-contract-htlc).
