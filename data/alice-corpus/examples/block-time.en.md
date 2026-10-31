---
type: "project_note"
id: "block-time"
title: "The time between blocks"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Mining and energy"]
aliases: ["Block Time", "Le temps entre les blocs"]
parent_ids: []
related_ids: ["mining-difficulty-details", "bitcoin-utxo"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://bitcoin.org/bitcoin.pdf", "https://developer.bitcoin.org/devguide/block_chain.html"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The time between blocks

## Questions covered

- Why can a block take more than 10 minutes?

## Short answer

Bitcoin targets 1 block every 10 minutes on average. The next block can arrive much faster or much later; this delay is not a guaranteed appointment.

## Explanation

Miners make a very large number of independent attempts. Finding a result that meets the difficulty remains probabilistic. Having already waited 10 minutes therefore does not mean the block must arrive immediately.

The difficulty adjustment reacts to variations in computing power to bring the average pace closer to its target. A sudden drop in hashrate can slow blocks down before that adjustment. This pace influences the wait for confirmations and the rhythm of issuance of new bitcoins.

## Limits and confusions

The delay until the next block does not by itself give the confirmation delay of your payment. The transaction must also be known to miners and selected into a block, which depends in particular on its fees.

Waiting for more confirmations reduces the reorganization risk under the usual security model; it does not provide mathematical irreversibility. The 10-minute target describes the protocol without proving all the historical intentions of its creator.

## Further reading

- [[mining-difficulty-details.en|The difficulty adjustment in detail]] — Difficulty adjustment — understand the pace correction
- [[bitcoin-utxo.en|Understanding UTXOs]] — follow the outputs of a confirmed transaction

## References

- [Bitcoin white paper, sections 7 and 11](https://bitcoin.org/bitcoin.pdf).
- [Developer guide, chain](https://developer.bitcoin.org/devguide/block_chain.html).
