---
type: "project_note"
id: "mining-difficulty-details"
title: "The difficulty adjustment in detail"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["mining"]
aliases: ["retarget", "cible de difficulté", "L’ajustement de difficulté en détail"]
parent_ids: ["bitcoin-mining"]
related_ids: []
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://developer.bitcoin.org/devguide/block_chain.html", "https://github.com/bitcoin/bitcoin/blob/v28.0/src/pow.cpp"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The difficulty adjustment in detail

## Questions covered

- Why does the network not immediately return to its pace after a drop in hashrate?

## Short answer

On Bitcoin mainnet, the proof-of-work target is readjusted at every period of 2,016 blocks. The pace objective is about 10 minutes per block.

## Explanation

If hashrate drops between 2 adjustments, finding blocks can take longer. The next adjustment responds to the time observed for the period according to the protocol rules. A higher target makes finding a proof easier; a lower target makes it harder.

On mainnet, 1 adjustment cannot divide the difficulty by more than 4 (maximum decrease of 75%, that is −75%), nor multiply it by more than 4 (maximum increase of 300%, that is +300%). After a very large change in hashrate, several adjustments may therefore be needed to return to the targeted average pace, if hashrate stabilizes.

The adjustment happens every 2,016 blocks, but the observed duration is computed between the timestamps of the first and last block of that period. That represents 2,015 intervals between blocks. This duration is compared with the target duration of 2,016 × 10 minutes, that is 14 days. This particularity of the computation explains why a simplified formula can differ from the implementation.

## Limits and confusions

The pace is statistical, not an appointment every 10 minutes. Test networks can apply other parameters. This note gives neither an exact implementation formula nor a profitability prediction.

## Further reading

- [[bitcoin-mining.en|Understanding mining]] (bitcoin-mining) — going back to the role of mining.

## References

- [Bitcoin Developer Guide, chain and difficulty](https://developer.bitcoin.org/devguide/block_chain.html).
- [Bitcoin Core 28.0, computation of the next target in `pow.cpp`](https://github.com/bitcoin/bitcoin/blob/v28.0/src/pow.cpp).
