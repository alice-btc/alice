---
type: "project_note"
id: "bitcoin-trustlessness"
title: "Verifying rather than trusting"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["fundamentals"]
aliases: ["Bitcoin Trustlessness", "Vérifier plutôt que faire confiance"]
parent_ids: []
related_ids: ["full-node", "self-custody", "threat-model", "secondary-bitcoin-bitcoin-security-assumptions"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc303 — Bitcoin Development Philosophy"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Verifying rather than trusting

## Questions covered

- Who do you have to trust with Bitcoin?

## Short answer

Bitcoin lets you verify the ledger's rules without entrusting that verification to a central institution. This reduces some needs for trust; it does not remove all trust in the real world.

## Explanation

A full node checks blocks, spends and monetary issuance. Its user therefore does not need to believe an explorer about the validity of the history they verify. In self-custody, spending authorizations rest on one's own keys rather than on a platform's promise of withdrawal.

In practice, most people use software and hardware they did not build nor audit in full. A wallet connected to a third-party server also depends on that server for certain information.

## Limits and confusions

"Without a trusted third party" describes a goal and certain properties of the protocol, not the infallibility of each product. A node does not protect against the disclosure of a recovery phrase. A hardware wallet does not guarantee that the chosen recipient is honest. You need to identify which function remains entrusted to which tool.

## Further reading

- [[full-node.en|Full validation]].
- [[self-custody.en|Self-custody of keys]].
- [[threat-model.en|Matching protection to risks]].

- [[secondary-bitcoin-bitcoin-security-assumptions.en|Bitcoin's security assumptions]].

## References

- PlanB btc303 — Bitcoin Development Philosophy.
