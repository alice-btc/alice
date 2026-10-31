---
type: "project_note"
id: "liquid-network"
title: "Understanding Liquid"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Ark and other layers"]
aliases: ["Liquid Network", "Comprendre Liquid"]
parent_ids: []
related_ids: ["sidechains", "counterparty-risk", "secondary-bitcoin-confidential-address", "secondary-bitcoin-confidential-transactions", "secondary-bitcoin-cryptographic-commitment", "secondary-bitcoin-pedersen-commitment"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://blog.liquid.net/liquid-network-security-incident-assessment/"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Understanding Liquid

## Questions covered

- What are the differences between Liquid and Bitcoin?

## Short answer

Liquid is a federated sidechain tied to Bitcoin. It notably uses L-BTC to represent bitcoin and allows other assets, with security and an exit mechanism that differ from Bitcoin on-chain.

## Explanation

Transactions are processed by the sidechain's architecture and its federation. The confidentiality features can hide certain amounts and asset types; they do not make all information invisible. Converting L-BTC back depends on the peg mechanism and its actors.

The Blockstream report published on the Liquid blog on 2026-09-25 describes an incident of 2026-09-06. A flaw in Elements made it possible to create about 4,000 L-BTC without backing, then withdraw the corresponding BTC. The assessment reports 3,400 BTC returned and about 602 BTC still to be recovered.

## Limits and confusions

This incident is not a creation of BTC on Bitcoin. It illustrates a risk of the sidechain software and of its conversion. The assessment comes from the organization involved.

The figures describe the dated report, not a real-time state. The current availability of exits, the balance recovered and the conversion conditions must be rechecked before an operational answer. The software fix and the restoration of withdrawals are separate questions.

## Further reading

- [[sidechains.en|Sidechains]] — understanding the peg's assumptions
- [[counterparty-risk.en|Counterparty risk]] — identifying conversion dependencies

- [[secondary-bitcoin-confidential-address.en|Liquid confidential addresses]].
- [[secondary-bitcoin-confidential-transactions.en|Confidential transactions]].
- [[secondary-bitcoin-cryptographic-commitment.en|Cryptographic commitments]].
- [[secondary-bitcoin-pedersen-commitment.en|Pedersen commitments]].

## References

- [Blockstream, Liquid Network Security Incident Assessment, 2026-09-25](https://blog.liquid.net/liquid-network-security-incident-assessment/).
