---
type: "project_note"
id: "lightning-invoice"
title: "Lightning invoices"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["Lightning Invoice", "Les factures Lightning"]
parent_ids: []
related_ids: ["bolt12-offers", "lightning-address"]
reviewed_at: "2026-11-06"
review_due: null
sources: ["PlanB lnp201 — Lightning Network Theory", "https://github.com/lightning/bolts/blob/master/11-payment-encoding.md"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Lightning invoices

## Questions covered

- Why can a Lightning invoice expire?

## Short answer

A Lightning invoice is a payment request readable by a compatible wallet. It provides the information needed to pay, notably a destination, an expiry and sometimes a fixed amount.

## Explanation

In the classic flow, the recipient generates a BOLT11 invoice and shares it as text or as a QR code. The payer's wallet decodes it to present the information before confirmation. The invoice can request a precise amount or let the payer choose one.

BOLT11 is encoded, not encrypted: anyone holding the invoice can decode its fields. An amount-bearing invoice exposes that encoded amount. The payee node public key is given explicitly in the n field or recovered from the invoice signature; it is not the payment hash in the p field. That hash identifies the payment condition, not an on-chain address or the recipient’s public key. Timestamp, expiry, description or description hash and optional routing hints may also be visible. A node public key is not proof of a person’s legal identity. Publishing an invoice can enable correlation but does not itself reveal private keys, a seed or the full purchase history.

The expiry prevents an old request from being used indefinitely. Routing hints are optional: they help reach the recipient, often through channels that are not announced, and can expose those channels. They describe the last hops toward the recipient, not the path the payment will take, which the payer's wallet computes. Changing any character invalidates the invoice checksum and signature: a partly hidden or edited invoice can no longer be paid. The invoice also contains cryptographic elements used by the settlement mechanism. It describes a request; by itself it does not prove that the payment took place.

## Limits and confusions

A Lightning invoice is not an on-chain Bitcoin address. A QR code can contain different formats; its appearance is not enough to know how to pay.

For a new request, it is preferable to obtain a fresh invoice rather than assume that an invoice already paid can be reused. A BOLT12 offer or a Lightning Address can stay stable while being used to obtain new invoices.

## Further reading

- [[bolt12-offers.en|BOLT12 offers]] — distinguishing a reusable offer from an invoice
- [[lightning-address.en|Lightning Addresses]] — understanding a stable receiving identifier

## References

- PlanB lnp201 — Lightning Network Theory (reference from the source note, not re-consulted directly for this adaptation).

- https://github.com/lightning/bolts/blob/master/11-payment-encoding.md
