---
type: "project_note"
id: "alice-practice-faucet"
title: "Getting test sats"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Alice App and learning"]
aliases: ["docs/test-wallet-faucet.md", "Obtenir des sats de test"]
parent_ids: []
related_ids: ["playground-testnet-limits", "alice-playground", "secondary-history-bitcoin-faucet"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["alice-repo:46e2e9da:docs/test-wallet-faucet.md"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Getting test sats

## Questions covered

- How does the distribution of sats for practice work?

## Short answer

Alice's faucet provides test sats for learning in the playground wallet. These units belong to the Mutinynet network and are not bitcoins usable on the main network.

## Explanation

In the documentation version reviewed at commit 46e2e9da, Alice distributes 2,100 sats from its own test wallet. It does not automatically relay a request to the public faucet. Distribution is limited to 1 request per installation and to 100 distributions per day for the platform.

These limits protect the reserve and spread its use. The per-installation limit is not proof of identity; the documentation states that clearing the data can renew this identifier. Availability also depends on the funding and configuration of the service.

## Limits and confusions

If the service cannot distribute, the planned flow opens the public Mutinynet faucet with the test address to use. This fallback does not guarantee that the external service will accept the request immediately.

Never use real funds or the recovery phrase of a real wallet in this flow. The amount and the limits describe the version consulted; this adaptation did not run a distribution nor verify the deployed service.

## Further reading

- [[playground-testnet-limits.en|What the playground lets you test]] — Limits of testing — distinguish practice from real money
- [[alice-playground.en|The Alice App playground wallet]] — find your way around the playground

- [[secondary-history-bitcoin-faucet.en|Gavin Andresen's historic faucet]].

## References

- [Faucet documentation at commit 46e2e9da](alice-repo:46e2e9da:docs/test-wallet-faucet.md).
