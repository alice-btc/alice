---
type: "project_note"
id: "block-reward"
title: "La rémunération d’un bloc"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Minage et énergie"]
aliases: ["Block Reward"]
parent_ids: []
related_ids: ["mining-pool", "mining-profitability", "secondary-bitcoin-coinbase-maturity", "secondary-bitcoin-coinbase-transaction", "secondary-bitcoin-fee-only-security-model", "secondary-bitcoin-fee-sniping"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://developer.bitcoin.org/devguide/mining.html", "https://bitcoin.org/bitcoin.pdf"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La rémunération d’un bloc

## Questions couvertes

- Que reçoit le mineur qui trouve un bloc ?

## Réponse courte

La rémunération maximale d’un bloc réunit la subvention, qui crée de nouveaux bitcoins, et les frais des transactions incluses. Le halving réduit la subvention, pas les frais.

## Explication

Le mineur inscrit cette rémunération dans la transaction coinbase du bloc. Les nœuds vérifient que le montant ne dépasse pas ce que les règles autorisent. Disposer de beaucoup de puissance de calcul ne permet donc pas de créer une subvention arbitraire.

Les frais proviennent de la différence entre les entrées et les sorties des transactions ordinaires. Leur niveau dépend de la demande d’espace dans les blocs. La subvention suit, elle, un calendrier de réduction indépendant de cette demande. Ces revenus contribuent à financer les machines, l’électricité et l’exploitation des mineurs.

## Limites et confusions

Le revenu brut n’est pas le bénéfice du mineur. Un pool applique également ses règles de répartition et ses frais.

La part des frais peut augmenter ou diminuer d’une période à l’autre. Après extinction de la subvention, les règles prévoient une rémunération par les frais ; leur niveau futur et la puissance de calcul qu’ils financeront ne sont pas garantis.

## Approfondissements

- [[mining-pool.fr|Les pools de minage]] — comprendre le partage du revenu
- [[mining-profitability.fr|Les coûts du minage]] — distinguer chiffre d’affaires et rentabilité

- [[secondary-bitcoin-coinbase-maturity.fr|La maturité des récompenses de bloc]].
- [[secondary-bitcoin-coinbase-transaction.fr|La transaction coinbase]].
- [[secondary-bitcoin-fee-only-security-model.fr|La rémunération minière fondée sur les frais]].
- [[secondary-bitcoin-fee-sniping.fr|La tentative de récupérer les frais d’un bloc récent]].

## Références

- [Guide développeur, minage](https://developer.bitcoin.org/devguide/mining.html).
- [Livre blanc Bitcoin, section 6](https://bitcoin.org/bitcoin.pdf).
