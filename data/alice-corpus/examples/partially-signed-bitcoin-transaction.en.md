---
type: "project_note"
id: "partially-signed-bitcoin-transaction"
title: "Preparing and signing a transaction with PSBT"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Partially Signed Bitcoin Transaction", "Préparer et signer une transaction avec PSBT"]
parent_ids: []
related_ids: ["hardware-wallet", "multisig", "cold-storage"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB pos305 — Mastering BTC Pay Server", "PlanB Extraction — 2026-05-23 — csv404"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Preparing and signing a transaction with PSBT

## Questions covered

- How can preparation and signing be separated?

## Short answer

PSBT is an exchange format for preparing and signing a Bitcoin transaction across several tools. It makes it possible to separate construction, verification, signing and broadcasting.

## Explanation

A computer can prepare the transaction with its inputs, its outputs and the useful information. A signing device then receives these elements, verifies what it can understand of them and adds the authorized signatures. Once the necessary signatures have been gathered, the transaction can be finalized and then broadcast.

This model is useful for a hardware wallet, offline storage or a multisig configuration. The private keys do not need to be transmitted to the computer that coordinates the payment.

## Limits and confusions

A PSBT can contain information that is sensitive for privacy. Its format guarantees neither the right destination nor the absence of malware. The signer must check what they authorize on their trusted interface. "Partially signed" refers to the format and the process; the file can also circulate before any signature.

## Further reading

- [[hardware-wallet.en|The role of a signing device]].
- [[multisig.en|Multisig]].
- [[cold-storage.en|Offline storage]].

## References

- PlanB pos305 — Mastering BTC Pay Server.
- PlanB Extraction — 2026-05-23 — csv404.
