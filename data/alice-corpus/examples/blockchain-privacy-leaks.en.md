---
type: "project_note"
id: "blockchain-privacy-leaks"
title: "Public information on the chain"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Blockchain Privacy Leaks", "Les informations publiques sur la chaîne"]
parent_ids: []
related_ids: ["bitcoin-transaction-structure", "common-input-ownership-heuristic", "change-privacy-linking", "secondary-bitcoin-confidential-transactions"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc303 — Bitcoin Development Philosophy"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Public information on the chain

## Questions covered

- What data does a transaction reveal?

## Short answer

Bitcoin transactions publish amounts, inputs, outputs and relationships with earlier transactions. This data serves to verify spends, but also makes it possible to study flows.

## Explanation

Address reuse directly links several incoming payments to the same identifier. A spend that combines several inputs can suggest common control. Amounts and change give further clues about the structure of a payment.

These observations become more meaningful when an actor holds external data, such as an invoice or a customer's identity. The traces remain available for new analyses after their publication.

## Limits and confusions

The chain does not tell the whole economic story. A transaction can be a transfer between wallets of the same person, a batched payment or a collaboration. Interpretations of ownership and change must therefore remain distinct from certain data. Reducing a leak does not guarantee the absence of links through another channel.

## Further reading

- [[bitcoin-transaction-structure.en|Reading a transaction in an explorer]].
- [[common-input-ownership-heuristic.en|The common-input ownership assumption]].
- [[change-privacy-linking.en|Change and privacy links]].

- [[secondary-bitcoin-confidential-transactions.en|Confidential transactions]].

## References

- PlanB btc303 — Bitcoin Development Philosophy.
