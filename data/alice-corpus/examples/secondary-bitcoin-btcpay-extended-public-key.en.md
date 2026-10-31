---
type: "project_note"
id: "secondary-bitcoin-btcpay-extended-public-key"
title: "Receiving with an extended public key in BTCPay"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["BTCPay Extended Public Key", "Recevoir avec une clé publique étendue dans BTCPay"]
parent_ids: ["btcpay-server", "extended-public-key"]
related_ids: ["btcpay-server", "extended-public-key"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pos305 — Mastering BTC Pay Server"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Receiving with an extended public key in BTCPay

## Questions covered

- Can BTCPay create addresses without holding my private keys?

## Short answer

BTCPay can derive receiving addresses from an extended public key without holding the keys needed to spend.

## Explanation

- It allows a watch-only wallet on the server side.
- If it leaks, it exposes the history and the future addresses of that branch.
- It must be treated as privacy-sensitive data.
- It makes it easier to avoid address reuse.

## Limits and confusions

Exposing this extended public key can reveal the history and the derived addresses of the branch concerned.

## Further reading

- [[btcpay-server.en|Understanding BTCPay Server]] — back to the basic concept.
- [[extended-public-key.en|The extended public key]] — back to the basic concept.

## References

- PlanB pos305 — Mastering BTC Pay Server
