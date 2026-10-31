---
type: "project_note"
id: "taproot"
title: "bc1p addresses and Taproot"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Taproot", "Les adresses bc1p et Taproot"]
parent_ids: []
related_ids: ["legacy-address", "bitcoin-address-scripts", "multisig", "secondary-addresses-mast", "secondary-bitcoin-ecdsa-signature", "secondary-bitcoin-musig", "secondary-bitcoin-schnorr-signature", "secondary-governance-taproot-activation"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# bc1p addresses and Taproot

## Questions covered

- What is the difference between bc1q and bc1p?

## Short answer

Taproot is an evolution of Bitcoin's spending conditions. On the main network, its addresses use Bech32m and start with bc1p.

## Explanation

Taproot combines Schnorr signatures with an organization of spending conditions that can avoid revealing every possibility that was planned. Some complex constructions can thus appear as a simple spend when the participants use the appropriate path.

For a beginner, the important point is the wallet's compatibility with the address type. Taproot replaces neither checking the recipient nor backing up the keys. It is a way of locking and spending outputs, not a separate Bitcoin network.

## Limits and confusions

The privacy and cost advantages depend on the construction used. A bc1p address is not anonymous and does not hide on-chain amounts. Taproot corresponds to SegWit version 1; bc1q refers to version 0. The script and aggregation mechanisms call for deeper study rather than a general promise of invisible transactions.

## Further reading

- [[legacy-address.en|Comparing Bitcoin address formats]].
- [[bitcoin-address-scripts.en|Addresses, scripts and spending conditions]].
- [[multisig.en|Multisig]].

- [[secondary-addresses-mast.en|Trees of spending conditions]].
- [[secondary-bitcoin-ecdsa-signature.en|ECDSA signatures in Bitcoin]].
- [[secondary-bitcoin-musig.en|Joint signatures with MuSig]].
- [[secondary-bitcoin-schnorr-signature.en|Schnorr signatures]].
- [[secondary-governance-taproot-activation.en|The activation of Taproot in 2021]].

## References

- PlanB cyp201 — Bitcoin Wallet Architecture.
- PlanB Extraction — 2026-05-23.
