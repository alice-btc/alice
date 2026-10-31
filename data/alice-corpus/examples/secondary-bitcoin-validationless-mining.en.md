---
type: "project_note"
id: "secondary-bitcoin-validationless-mining"
title: "Mining without having validated the previous block"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Validationless Mining", "Miner sans avoir validé le bloc précédent"]
parent_ids: ["bitcoin-mining", "full-node"]
related_ids: ["bitcoin-mining", "full-node"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB btc303 — Bitcoin Development Philosophy"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Mining without having validated the previous block

## Questions covered

- What risk does a miner take by starting work too quickly on a block it has received?

## Short answer

Mining on top of a received block before validating it can extend an invalid branch and cost the miner revenue.

## Explanation

- The miner may check only the header and the proof of work.
- This practice can extend an invalid chain if the parent block is invalid.
- BIP66 produced temporary splits because of miners that signaled without validating.
- It shows why miners themselves need to use real full nodes.

## Limits and confusions

A valid proof of work is not enough to prove that all the block's rules are respected.

## Further reading

- [[bitcoin-mining.en|Understanding mining]] — back to the basic concept.
- [[full-node.en|Full validation]] — back to the basic concept.

## References

- PlanB btc303 — Bitcoin Development Philosophy
