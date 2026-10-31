---
type: "project_note"
id: "secondary-bitcoin-extended-private-key"
title: "Extended private keys"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Extended Private Key", "Les clés privées étendues"]
parent_ids: ["hd-wallet", "bitcoin-private-key"]
related_ids: ["hd-wallet", "bitcoin-private-key"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Extended private keys

## Questions covered

- Why is an extended private key particularly sensitive?

## Short answer

An extended private key makes it possible to derive child private keys within a wallet hierarchy.

## Explanation

- It is often represented with prefixes such as xprv, yprv or zprv depending on the context.
- If it leaks, an entire branch of the wallet can be compromised.
- It contains or implies a chain code.
- It can produce the corresponding extended public key.

## Limits and confusions

A leak can compromise an entire branch; it must stay secret, unlike simple receiving data.

## Further reading

- [[hd-wallet.en|Deterministic wallets]] — back to the basic concept.
- [[bitcoin-private-key.en|The private key]] — back to the basic concept.

## References

- PlanB cyp201 — Bitcoin Wallet Architecture
