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
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB lnp201 — Lightning Network Theory"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
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

The expiry prevents an old request from being used indefinitely. Routing hints help reach the recipient. The invoice also contains cryptographic elements used by the settlement mechanism. It describes a request; by itself it does not prove that the payment took place.

## Limits and confusions

A Lightning invoice is not an on-chain Bitcoin address. A QR code can contain different formats; its appearance is not enough to know how to pay.

For a new request, it is preferable to obtain a fresh invoice rather than assume that an invoice already paid can be reused. A BOLT12 offer or a Lightning Address can stay stable while being used to obtain new invoices.

## Further reading

- [[bolt12-offers.en|BOLT12 offers]] — distinguishing a reusable offer from an invoice
- [[lightning-address.en|Lightning Addresses]] — understanding a stable receiving identifier

## References

- PlanB lnp201 — Lightning Network Theory (reference from the source note, not re-consulted directly for this adaptation).
