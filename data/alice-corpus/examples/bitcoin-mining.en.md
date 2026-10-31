---
type: "project_note"
id: "bitcoin-mining"
title: "Understanding mining"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["mining"]
aliases: ["minage", "mining", "Comprendre le minage"]
parent_ids: []
related_ids: ["mining-difficulty-details", "bitcoin-energy-debate", "mining-curtailed-energy", "mining-grid-flexibility", "mining-heat-reuse-details", "mining-methane-mitigation", "mining-renewable-projects", "secondary-bitcoin-stale-block", "secondary-bitcoin-validationless-mining"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://developer.bitcoin.org/devguide/mining.html", "https://bitcoin.org/bitcoin.pdf", "https://developer.bitcoin.org/devguide/block_chain.html"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Understanding mining

## Questions covered

- What is Bitcoin mining for?
- Do miners decide the rules on their own?

## Short answer

Mining adds blocks to the chain and makes rewriting the history costly. Miners search for a proof of work; each node verifies that the block respects its rules. The authorized subsidy also puts new bitcoins into circulation.

## Explanation

Miners choose the transactions they propose in their blocks, generally taking fees into account. They can delay certain transactions by leaving them out of their own blocks. They cannot impose on other nodes a block that those nodes consider invalid.

The computation consists of searching for a hash of the block header that is lower than or equal to a target value. Finding this proof requires many attempts; verifying it is fast. The coinbase transaction can award the miner at most the authorized subsidy plus the fees of the included transactions. This revenue is the incentive to mine; it does not replace the role of proof of work in protecting the history.

## Limits and confusions

A large amount of computing power does not automatically get an invalid block accepted. The time between 2 blocks varies. Mining guarantees neither a regular income nor a profit.

## Further reading

- [[bitcoin-energy-debate.en|Bitcoin and energy — understanding costs and useful uses]] (bitcoin-energy-debate) to explore electricity sources and possible energy services.
- [[mining-difficulty-details.en|The difficulty adjustment in detail]] (mining-difficulty-details) to understand how the target evolves when the hashrate changes.

- [[mining-curtailed-energy.en|When mining monetizes energy with no outlet]].
- [[mining-grid-flexibility.en|How miners can help balance a power grid]].
- [[mining-heat-reuse-details.en|Reusing mining heat for heating]].
- [[mining-methane-mitigation.en|When mining can fund a reduction in methane emissions]].
- [[mining-renewable-projects.en|How mining can support a renewable project]].
- [[secondary-bitcoin-stale-block.en|Valid blocks that are not kept]].
- [[secondary-bitcoin-validationless-mining.en|Mining without having validated the previous block]].

## References

- [Bitcoin Developer Guide, mining](https://developer.bitcoin.org/devguide/mining.html).

- [Bitcoin white paper, sections 4, 5 and 6](https://bitcoin.org/bitcoin.pdf).

- [Bitcoin Developer Guide, blocks and proof of work](https://developer.bitcoin.org/devguide/block_chain.html).
