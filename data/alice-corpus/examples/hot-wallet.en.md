---
type: "project_note"
id: "hot-wallet"
title: "Hot wallets"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["Hot Wallet", "Le portefeuille connecté"]
parent_ids: []
related_ids: ["cold-storage", "hardware-wallet", "threat-model", "secondary-bitcoin-btcpay-hot-wallet"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc102 — Getting your first bitcoins", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Hot wallets

## Questions covered

- What is a hot wallet?

## Short answer

A hot wallet keeps usable keys on a device connected to the Internet. It makes frequent payments easier, but exposes those keys to the risks of that environment.

## Explanation

A mobile or desktop wallet can play this role. Its security depends notably on the operating system, the installed applications, access protection and backup management. Malware or a fake support contact can target the secret or manipulate an operation.

The choice is reasoned according to the use, the funds involved and the consequences of a compromise. Separating everyday spending needs from storage needs can limit exposure without removing every risk.

## Limits and confusions

An interface on a computer is not necessarily a hot wallet if the signatures are produced by a separate device. Conversely, a rarely used device is not automatically a safe offline storage setup. "Hot" describes the exposure of the keys; "custodial" describes who controls them. These categories answer different questions.

## Further reading

- [[cold-storage.en|Offline storage]].
- [[hardware-wallet.en|The role of a signing device]].
- [[threat-model.en|Matching protection to risks]].

- [[secondary-bitcoin-btcpay-hot-wallet.en|Private keys on a BTCPay server]].

## References

- PlanB btc102 — Getting your first bitcoins.
- PlanB Extraction — 2026-05-23.
