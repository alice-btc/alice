---
type: "project_note"
id: "bitcoin-halving"
title: "The halving"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["fundamentals"]
aliases: ["Bitcoin Halving", "Le halving"]
parent_ids: []
related_ids: ["bitcoin-monetary-policy", "bitcoin-finite-supply", "bitcoin-mining", "secondary-bitcoin-fee-only-security-model", "secondary-economics-stock-to-flow-ratio"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/bitcoin/bitcoin/blob/master/src/kernel/chainparams.cpp", "https://developer.bitcoin.org/devguide/block_chain.html"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The halving

## Questions covered

- What does a halving change?

## Short answer

The halving divides the block subsidy by 2 every 210,000 blocks on the main network, roughly every 4 years. It reduces the creation of new bitcoins.

## Explanation

A miner's reward has 2 distinct components. The subsidy creates new bitcoins; the fees come from the transactions included in the block. The halving concerns only the subsidy. It divides neither transaction fees nor holders' balances.

The threshold is a block height. Its calendar date therefore depends on the actual pace of block production and is only known in advance by estimate. Successive halvings make issuance decrease toward its cap.

## Limits and confusions

A halving promises no price increase. Its market effects depend in particular on demand, expectations and economic conditions. Miners' profitability also depends on the price, fees, operating costs and competition. Saying "reward divided by 2" is imprecise if that reward includes fees.

## Further reading

- [[bitcoin-monetary-policy.en|Bitcoin's monetary issuance]].
- [[bitcoin-finite-supply.en|The limit on bitcoin supply]].
- [[bitcoin-mining.en|Understanding mining]].

- [[secondary-bitcoin-fee-only-security-model.en|Miner revenue based on fees]].
- [[secondary-economics-stock-to-flow-ratio.en|The stock-to-flow ratio and its limits]].

## References

- [Public reference kept from the source note](https://github.com/bitcoin/bitcoin/blob/master/src/kernel/chainparams.cpp).
- [Public reference kept from the source note](https://developer.bitcoin.org/devguide/block_chain.html).
