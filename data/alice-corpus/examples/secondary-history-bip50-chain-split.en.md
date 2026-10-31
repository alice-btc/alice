---
type: "project_note"
id: "secondary-history-bip50-chain-split"
title: "The accidental chain split of March 2013"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["history"]
aliases: ["BIP50 Chain Split", "La scission accidentelle de mars 2013"]
parent_ids: ["bitcoin-consensus", "bitcoin-governance"]
related_ids: ["bitcoin-consensus", "bitcoin-governance"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB btc303 — Bitcoin Development Philosophy"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The accidental chain split of March 2013

## Questions covered

- Why did Bitcoin nodes diverge in March 2013?

## Short answer

BIP50 documents the March 2013 split between Bitcoin 0.7 and 0.8, caused by an implicit Berkeley DB lock limit that had become an accidental consensus rule.

## Explanation

- A block containing many inputs was accepted by 0.8 and rejected by some pre-0.8 nodes.
- Major pools downgraded to bring the hashrate back onto the 0.7-compatible branch.
- The resolution combined fast mining action and temporary patches.
- The incident shows that an implementation constraint can become an unintended consensus rule.

## Limits and confusions

The historical incident does not allow one to conclude that similar coordination would be simple or guaranteed today.

## Further reading

- [[bitcoin-consensus.en|Consensus]] — to go back to the basic notion.
- [[bitcoin-governance.en|How the rules evolve]] — to go back to the basic notion.

## References

- PlanB btc303 — Bitcoin Development Philosophy
