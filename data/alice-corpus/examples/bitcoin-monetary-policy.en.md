---
type: "project_note"
id: "bitcoin-monetary-policy"
title: "Bitcoin's monetary issuance"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["fundamentals"]
aliases: ["Bitcoin Monetary Policy", "L’émission monétaire de Bitcoin"]
parent_ids: []
related_ids: ["bitcoin-halving", "bitcoin-finite-supply", "block-reward", "secondary-economics-denationalization-of-money", "secondary-economics-sound-money"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc101 — The Bitcoin Journey", "PlanB Extraction — 2026-05-23 — btc303"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Bitcoin's monetary issuance

## Questions covered

- How are new bitcoins issued?

## Short answer

New bitcoins are issued as a block subsidy. The rules set its decrease over the blocks; no committee periodically decides to increase the quantity in response to economic conditions.

## Explanation

The miner of a valid block can receive the authorized subsidy plus the fees of the included transactions. The subsidy corresponds to new bitcoins. The fees correspond to bitcoins that already exist. Nodes check that the block's reward transaction does not claim more than this total.

The schedule is defined by block height. It is therefore not a perfectly regular calendar schedule. The time between 2 blocks varies, even though the difficulty adjustment targets an average of about 10 minutes.

## Limits and confusions

Predictable issuance does not imply a predictable price. The halving reduces the flow of monetary creation, not all of miners' revenue nor the quantity already held in wallets. Debates about economic effects must remain distinct from these verifiable protocol rules.

## Further reading

- [[bitcoin-halving.en|The halving]].
- [[bitcoin-finite-supply.en|The limit on bitcoin supply]].
- [[block-reward.en|The block reward]].

- [[secondary-economics-denationalization-of-money.en|The currency competition proposed by Hayek]].
- [[secondary-economics-sound-money.en|What sound money means]].

## References

- PlanB btc101 — The Bitcoin Journey.
- PlanB Extraction — 2026-05-23 — btc303.
