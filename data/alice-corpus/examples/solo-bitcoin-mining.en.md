---
type: "project_note"
id: "solo-bitcoin-mining"
title: "Solo mining"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Mining and energy"]
aliases: ["Solo Bitcoin Mining", "Le minage en solo"]
parent_ids: []
related_ids: ["mining-pool", "mining-profitability", "secondary-bitcoin-bitaxe", "secondary-bitcoin-home-bitcoin-mining", "secondary-bitcoin-mining-variance"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://developer.bitcoin.org/devguide/mining.html"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Solo mining

## Questions covered

- What does mining alone mean?

## Short answer

In solo mining, the miner who finds the block receives its revenue instead of sharing it with the participants of a classic pool. For a small machine, the gains are very rare and irregular.

## Explanation

The probability of finding a block depends on the share of hashrate held. With a hypothetical, constant share of 0.0001%, the probability of finding the next block is about 1 in 1,000,000. A long period without success does not force the next attempt to succeed.

A solo mining service can provide the technical infrastructure and take a fee, while leaving the block revenue to the single winning miner. "Solo" then describes how the revenue is distributed; it does not necessarily mean that every component is self-hosted.

## Limits and confusions

At identical hashpower and before fees, solo mining mainly increases the variance of revenue compared with pooling it. An exceptional success does not describe typical profitability.

Taking part out of technical interest, to learn or to disperse hardware is a different objective from seeking regular income. The electricity cost and the hardware still have to be paid for even if no block is found.

## Further reading

- [[mining-pool.en|Mining pools]] — compare with pooling
- [[mining-profitability.en|The costs of mining]] — distinguish expected revenue from costs

- [[secondary-bitcoin-bitaxe.en|Bitaxe miners]].
- [[secondary-bitcoin-home-bitcoin-mining.en|Home mining]].
- [[secondary-bitcoin-mining-variance.en|The irregularity of mining results]].

## References

- [Bitcoin Developer Guide, solo and pool mining](https://developer.bitcoin.org/devguide/mining.html).
