---
type: "project_note"
id: "secondary-bitcoin-bitcoin-security-assumptions"
title: "Bitcoin's security assumptions"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Bitcoin Security Assumptions", "Les hypothèses de sécurité de Bitcoin"]
parent_ids: ["bitcoin-consensus", "bitcoin-trustlessness"]
related_ids: ["bitcoin-consensus", "bitcoin-trustlessness"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB btc303 — Bitcoin Development Philosophy"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Bitcoin's security assumptions

## Questions covered

- Which assumptions does Bitcoin's security rest on?

## Short answer

Bitcoin's security depends on cryptographic assumptions and on network, economic and operational behaviors.

## Explanation

- Some assumptions are cryptographic, others economic or social.
- Bitcoin has no complete formal security model comparable to that of a small, isolated protocol.
- What is studied instead are the incentives and behaviors of actors within a complex system.
- When an assumption turns out to be false, the design must be adapted or a limit acknowledged.

## Limits and confusions

The validity of a cryptographic primitive does not by itself prove the security of the whole system.

## Further reading

- [[bitcoin-consensus.en|Consensus]] — back to the basic concept.
- [[bitcoin-trustlessness.en|Verifying rather than trusting]] — back to the basic concept.

## References

- PlanB btc303 — Bitcoin Development Philosophy
