---
type: "project_note"
id: "utxo-labeling"
title: "Labeling your UTXOs"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["privacy"]
aliases: ["UTXO Labeling", "Étiqueter ses UTXO"]
parent_ids: []
related_ids: ["coin-control", "wallet-backup", "non-blockchain-privacy-leaks", "secondary-privacy-kyc-bitcoin-acquisition"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc204 — Privacy on Bitcoin", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Labeling your UTXOs

## Questions covered

- Why record the origin of your funds?

## Short answer

Labeling your UTXOs consists of recording their origin and context in the wallet. This helps in understanding which funds will be linked together when spending.

## Explanation

A label can distinguish a business receipt, a refund, a donation or change. This information cannot always be deduced from the public transaction. It makes coin control more understandable and can make it easier to track funds of different origins.

Labels are part of the wallet's data. They may require a backup separate from the recovery words, which rebuild the keys but not necessarily all the annotations.

## Limits and confusions

Labels can be highly sensitive. Their disclosure can explicitly link identities to transactions and reveal more than the public history alone. A good label does not make a UTXO technically different and erases no past trace. How the software stores, synchronizes or exports this information also has to be checked.

## Further reading

- [[coin-control.en|Choosing the funds to spend]].
- [[wallet-backup.en|Preparing a backup]].
- [[non-blockchain-privacy-leaks.en|Leaks outside the blockchain]].

- [[secondary-privacy-kyc-bitcoin-acquisition.en|The traces left by a purchase with identity verification]].

## References

- PlanB btc204 — Privacy on Bitcoin.
- PlanB Extraction — 2026-05-23.
