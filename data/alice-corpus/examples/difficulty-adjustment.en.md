---
type: "project_note"
id: "difficulty-adjustment"
title: "The difficulty adjustment"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["mining"]
aliases: ["Difficulty Adjustment", "L’ajustement de difficulté"]
parent_ids: []
related_ids: ["mining-difficulty", "mining-difficulty-details", "bitcoin-monetary-policy"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/bitcoin/bitcoin/blob/v28.0/src/pow.cpp", "https://github.com/bitcoin/bitcoin/blob/v28.0/src/kernel/chainparams.cpp"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The difficulty adjustment

## Questions covered

- How does Bitcoin react when miners arrive or leave?

## Short answer

On the main network, Bitcoin recalculates the difficulty every 2,016 blocks to target an average pace of 10 minutes per block. It reacts to the observed speed, not to a committee's decision.

## Explanation

If hashrate increases and blocks arrive faster, the difficulty tends to rise. If many miners stop and blocks slow down, it tends to fall. Between adjustments, the waiting time can therefore drift away from the targeted average for a sustained period.

This mechanism prevents hardware improvements from speeding up the issuance schedule without limit. It does not change the amount of subsidy allowed at a given block height.

## Limits and confusions

The adjustment has bounds. A very large change in hashrate can take several periods before the pace returns to the expected cadence. The usual limits are ÷4, that is −75%, and ×4, that is +300% of difficulty, subject to the constraints of the maximum target and its encoding. The difference between 2,016 blocks and 2,015 measured intervals is detailed in the further reading note.

## Further reading

- [[mining-difficulty.en|Mining difficulty]].
- [[mining-difficulty-details.en|The difficulty adjustment in detail]].
- [[bitcoin-monetary-policy.en|Bitcoin's monetary issuance]].

## References

- [Public reference kept from the source note](https://github.com/bitcoin/bitcoin/blob/v28.0/src/pow.cpp).
- [Public reference kept from the source note](https://github.com/bitcoin/bitcoin/blob/v28.0/src/kernel/chainparams.cpp).
