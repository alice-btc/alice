---
type: "project_note"
id: "dust"
title: "Dust and uneconomic outputs"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Dust", "poussière", "dust limit", "sortie non rentable", "Le dust et les sorties non rentables"]
parent_ids: []
related_ids: ["coin-selection-tradeoffs", "transaction-fees", "bitcoin-mempool-policy", "consolidation-transaction"]
reviewed_at: "2026-11-05"
review_due: null
sources: ["https://github.com/bitcoin/bitcoin/blob/v30.0/src/policy/policy.cpp", "https://github.com/bitcoin/bitcoin/blob/v30.0/src/policy/policy.h"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "reviewed"
---
# Dust and uneconomic outputs

## Questions covered

- Why does my wallet say a small amount is uneconomic to spend?
- What are dust and the dust limit?

## Short answer

The word dust covers two notions. The dust limit is a relay rule: by default, a Bitcoin Core node refuses to relay a transaction that creates an output too small to be worth the cost of spending it. An output that is "uneconomic to spend" is a judgment of the wallet: at the current fee rate, spending that output would cost as much as or more than it is worth.

## Explanation

The relay rule sets a threshold per script type. Bitcoin Core adds the size of the output to the size of the input that will spend it, then multiplies that total by a reference rate, the `dustrelayfee` setting, 3,000 sats per kvB by default, that is 3 sats/vB. An output worth less than that cost is dust, and the transaction creating it is not relayed. With the default settings, the threshold is 546 sats for a P2PKH output, 294 sats for a P2WPKH output and 330 sats for a P2WSH or P2TR output. This threshold does not follow current fees: it stays fixed as long as the setting does not change.

The wallet's judgment, on the other hand, depends on the current fee rate. Spending an output adds an input to the transaction, about 68 vB for a P2WPKH input or 58 vB for a P2TR input. Fictional example: at 10 sats/vB, that input alone costs several hundred sats, so a 300 sat output is spent at a loss, and many wallets leave it out of the selection or flag it as uneconomic. When fees drop, the same output can become economic to spend again, for instance in a consolidation transaction.

## Limits and confusions

Receiving an output below the relay threshold remains possible: a miner can include a transaction that nodes with default settings do not relay, and other settings exist. The relay threshold is not a consensus rule; a block containing a 1 sat output remains valid. Conversely, an output above the threshold, for instance 300 sats in P2WPKH, can remain uneconomic to spend as long as fees are high. The figures quoted are those of Bitcoin Core's default settings; a wallet or a node may apply other values, and the exact calculation depends on the version. An uneconomic output is not lost: it may become economic to spend if the fee rate falls sufficiently, without a guarantee.

Consolidating small outputs also costs fees, with 1 input per output spent. Consolidation does not remove that cost or guarantee spending without a loss; it can reduce the cost when done at a lower fee rate.

## Further reading

- [[coin-selection-tradeoffs.en|UTXO selection and trade-offs]].
- [[transaction-fees.en|Transaction fees]].
- [[bitcoin-mempool-policy.en|Local rules and consensus]].
- [[consolidation-transaction.en|UTXO consolidation]].

## References

- [Bitcoin Core 30.0, dust threshold per output type](https://github.com/bitcoin/bitcoin/blob/v30.0/src/policy/policy.cpp).
- [Bitcoin Core 30.0, dust reference rate](https://github.com/bitcoin/bitcoin/blob/v30.0/src/policy/policy.h).
