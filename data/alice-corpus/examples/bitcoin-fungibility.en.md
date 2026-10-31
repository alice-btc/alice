---
type: "project_note"
id: "bitcoin-fungibility"
title: "Fungibility"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Cryptography and protocol limits"]
aliases: ["Bitcoin Fungibility", "La fongibilité"]
parent_ids: []
related_ids: ["change-privacy-linking", "financial-censorship", "secondary-bitcoin-virgin-bitcoin"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB pro101 — Bitcoin Development Fundamentals"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Fungibility

## Questions covered

- Are all bitcoins interchangeable in practice?

## Short answer

Fungibility is the ability to exchange units of the same good without any particular distinction. For Bitcoin, the validity of units within the protocol must be distinguished from their practical acceptance by services.

## Explanation

On-chain transactions leave a public history. Some actors can analyze this history and apply their own policies to the funds they accept. These decisions can create differences in treatment, even when the outputs satisfy the network's rules.

Privacy therefore plays a role in monetary use. Avoiding unnecessary links between transactions, or using suitable tools, can reduce some of the information that is accessible. The question is not limited to keeping the user's name secret; it also concerns the links between their activities.

## Limits and confusions

A label assigned by an analytics company is neither a universal rule of Bitcoin nor certain proof of ownership or intent. Classifications can be incomplete or wrong.

A privacy technique does not guarantee that every service will accept the funds. Promises of bitcoins made "clean" or impossible to link should be avoided. Alice must explain the limits of inferences and policies rather than present a commercial category as an absolute property of sats.

## Further reading

- [[change-privacy-linking.en|Change and privacy links]] — Change — understand the links between transactions
- [[financial-censorship.en|Financial censorship]] — examine the effects of acceptance policies

- [[secondary-bitcoin-virgin-bitcoin.en|Freshly mined bitcoins]].

## References

- PlanB pro101 — Bitcoin Development Fundamentals (reference from the source note, not re-consulted directly for this adaptation).
