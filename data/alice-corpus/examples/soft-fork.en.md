---
type: "project_note"
id: "soft-fork"
title: "Soft forks"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["History and evolution of the protocol"]
aliases: ["Soft Fork", "Les soft forks"]
parent_ids: []
related_ids: ["hard-fork", "bitcoin-improvement-proposal", "secondary-bitcoin-bitcoin-covenants", "secondary-governance-taproot-activation"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://developer.bitcoin.org/devguide/block_chain.html#consensus-rule-changes", "https://github.com/bitcoin/bips/blob/master/bip-0009.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0008.mediawiki"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Soft forks

## Questions covered

- What is a soft fork?

## Short answer

A soft fork tightens the validity rules. Blocks that comply with the new restrictions remain acceptable under the old rules, but old nodes do not themselves verify these additional restrictions.

## Explanation

It can be understood as a reduction of the set of allowed blocks. An updated node may reject a block that an old node would still consider valid. This is why compatibility has to be described by the behavior of nodes, rather than by a vague promise of a risk-free update.

Activation requires coordination and a defined mechanism. Some arrangements use miner signaling, but this signaling does not automatically update every user and is not the only possible path.

## Limits and confusions

Compatibility does not prevent every split if the restrictions are not applied consistently. An old node may follow blocks without verifying all the new conditions.

A soft fork proposal is not an activation. The text, the code that implements the rule, the deployment parameters and what is actually enforced on the network have to be distinguished. The term does not guarantee that a change is desirable either.

## Further reading

- [[hard-fork.en|Hard forks]] — compare the behavior of old nodes
- [[bitcoin-improvement-proposal.en|BIP proposals]] — separate proposal from deployment

- [[secondary-bitcoin-bitcoin-covenants.en|Restrictions on future spending]].
- [[secondary-governance-taproot-activation.en|The activation of Taproot in 2021]].

## References

- [Bitcoin Developer Guide — consensus changes and fork risks](https://developer.bitcoin.org/devguide/block_chain.html#consensus-rule-changes).
- [BIP9 — activation by version bits](https://github.com/bitcoin/bips/blob/master/bip-0009.mediawiki).
- [BIP8 — activation and mandatory signaling depending on parameters](https://github.com/bitcoin/bips/blob/master/bip-0008.mediawiki).
