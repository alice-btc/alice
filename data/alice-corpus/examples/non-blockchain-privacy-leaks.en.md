---
type: "project_note"
id: "non-blockchain-privacy-leaks"
title: "Leaks outside the blockchain"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Non-Blockchain Privacy Leaks", "Les fuites hors de la blockchain"]
parent_ids: []
related_ids: ["bitcoin-p2p-privacy", "kyc-data-leakage", "utxo-labeling", "secondary-bitcoin-privacy-by-omission", "secondary-opsec-bitcoin-discretion", "secondary-privacy-browser-compartmentalization", "secondary-privacy-metadata-hygiene", "secondary-privacy-private-browsing-mode", "secondary-privacy-public-wi-fi-risk"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc303 — Bitcoin Development Philosophy"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Leaks outside the blockchain

## Questions covered

- Which habits can reveal my Bitcoin usage?

## Short answer

Privacy can be compromised without analyzing the blockchain directly. Accounts, devices, purchases and human interactions often provide the context that links a transaction to a person.

## Explanation

A wallet server can observe the addresses that are looked up. A merchant knows about a delivery. A support team can receive a screenshot revealing a balance or a history. A public post can make habits and presumed holdings known.

These elements can be combined with the public ledger. Good on-chain practice is therefore not enough if the same information is later published or passed on to a third party without need.

## Limits and confusions

A privacy tool protects a specific perimeter. Tor acts on part of the network; coin control acts on the selection of funds; neither removes an identity already shared in a conversation or a customer database. The useful measures depend on the sensitive information and on the actors able to link it together.

## Further reading

- [[bitcoin-p2p-privacy.en|Privacy on the network]].
- [[kyc-data-leakage.en|Exposed identification data]].
- [[utxo-labeling.en|Labeling your UTXOs]].

- [[secondary-bitcoin-privacy-by-omission.en|Privacy by publishing less data]].
- [[secondary-opsec-bitcoin-discretion.en|Discretion about your bitcoins]].
- [[secondary-privacy-browser-compartmentalization.en|Separating your uses in the browser]].
- [[secondary-privacy-metadata-hygiene.en|The metadata hidden in files]].
- [[secondary-privacy-private-browsing-mode.en|The limits of private browsing]].
- [[secondary-privacy-public-wi-fi-risk.en|The risks of an untrusted Wi-Fi network]].

## References

- PlanB btc303 — Bitcoin Development Philosophy.
