---
type: "project_note"
id: "block-reward"
title: "The block reward"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Mining and energy"]
aliases: ["Block Reward", "La rémunération d’un bloc"]
parent_ids: []
related_ids: ["mining-pool", "mining-profitability", "secondary-bitcoin-coinbase-maturity", "secondary-bitcoin-coinbase-transaction", "secondary-bitcoin-fee-only-security-model", "secondary-bitcoin-fee-sniping"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://developer.bitcoin.org/devguide/mining.html", "https://bitcoin.org/bitcoin.pdf"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The block reward

## Questions covered

- What does the miner who finds a block receive?

## Short answer

The maximum reward of a block combines the subsidy, which creates new bitcoins, and the fees of the included transactions. The halving reduces the subsidy, not the fees.

## Explanation

The miner records this reward in the block's coinbase transaction. Nodes verify that the amount does not exceed what the rules allow. Having a lot of computing power therefore does not make it possible to create an arbitrary subsidy.

Fees come from the difference between the inputs and the outputs of ordinary transactions. Their level depends on the demand for block space. The subsidy, for its part, follows a reduction schedule independent of that demand. This revenue helps fund the miners' machines, electricity and operations.

## Limits and confusions

Gross revenue is not the miner's profit. A pool also applies its own distribution rules and fees.

The share of fees can rise or fall from one period to another. After the subsidy ends, the rules provide for a reward made of fees; their future level and the computing power they will fund are not guaranteed.

## Further reading

- [[mining-pool.en|Mining pools]] — understand revenue sharing
- [[mining-profitability.en|The costs of mining]] — distinguish revenue from profitability

- [[secondary-bitcoin-coinbase-maturity.en|Block reward maturity]].
- [[secondary-bitcoin-coinbase-transaction.en|The coinbase transaction]].
- [[secondary-bitcoin-fee-only-security-model.en|Miner revenue based on fees]].
- [[secondary-bitcoin-fee-sniping.en|Trying to capture the fees of a recent block]].

## References

- [Developer guide, mining](https://developer.bitcoin.org/devguide/mining.html).
- [Bitcoin white paper, section 6](https://bitcoin.org/bitcoin.pdf).
