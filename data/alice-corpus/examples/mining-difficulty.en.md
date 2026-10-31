---
type: "project_note"
id: "mining-difficulty"
title: "Mining difficulty"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["mining"]
aliases: ["Mining Difficulty", "La difficulté de minage"]
parent_ids: []
related_ids: ["hashrate", "difficulty-adjustment", "mining-difficulty-details"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/bitcoin/bitcoin/blob/v28.0/src/pow.cpp"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Mining difficulty

## Questions covered

- What does a rise in difficulty mean?

## Short answer

The difficulty expresses how demanding it is to find a proof of work relative to a reference. A rise means that, on average, more attempts are needed to produce a block.

## Explanation

Miners look for a hash lower than or equal to a target. A lower target makes the condition harder to satisfy. This does not turn an individual attempt into a more complex computation; it reduces the proportion of acceptable results.

On the main network, the difficulty is adjusted every 2,016 blocks to target an average of about 10 minutes. The mechanism reacts to the observed pace, notably when hashrate changes.

## Limits and confusions

Difficulty is not hashrate, even though the 2 are linked. It does not guarantee a block exactly every 10 minutes and does not by itself measure a miner's profitability. The adjustment limits and the measurement over 2,015 intervals require an extra level of detail, kept in the secondary note.

## Further reading

- [[hashrate.en|Hashrate]].
- [[difficulty-adjustment.en|The difficulty adjustment]].
- [[mining-difficulty-details.en|The difficulty adjustment in detail]].

## References

- [Public reference kept from the source note](https://github.com/bitcoin/bitcoin/blob/v28.0/src/pow.cpp).
