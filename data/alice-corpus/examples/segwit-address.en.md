---
type: "project_note"
id: "segwit-address"
title: "bc1q addresses"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["SegWit Address", "Les adresses bc1q"]
parent_ids: []
related_ids: ["legacy-address", "taproot", "bitcoin-address-scripts", "secondary-tx-model-transaction-malleability"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture", "PlanB Extraction — 2026-05-24 — Glossary"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# bc1q addresses

## Questions covered

- What is a SegWit address?

## Short answer

On the main network, addresses that start with bc1q correspond to SegWit version 0 and use Bech32 encoding. They are distinct, in particular, from Taproot addresses, which start with bc1p.

## Explanation

SegWit separates certain signature data and changes its contribution to the transaction's weight. Some spends thereby become more economical in space and in fees at an equal fee rate. The Bech32 format also provides detection of typing errors.

The receiving format and the wallet that manages it have to be distinguished. Restoring the right keys with the wrong address type or the wrong derivation path can prevent software from finding the expected funds.

## Limits and confusions

The prefix depends on the network; bc concerns the main network. A bc1q address guarantees neither anonymity nor always-minimal fees. The error check does not make it possible to correct an address meant for a payment by guesswork.

## Further reading

- [[legacy-address.en|Comparing Bitcoin address formats]].
- [[taproot.en|bc1p addresses and Taproot]].
- [[bitcoin-address-scripts.en|Addresses, scripts and spending conditions]].

- [[secondary-tx-model-transaction-malleability.en|Transaction malleability]].

## References

- PlanB cyp201 — Bitcoin Wallet Architecture.
- PlanB Extraction — 2026-05-24 — Glossary.
