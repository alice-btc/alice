---
type: "project_note"
id: "lightning-address"
title: "Lightning Addresses"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["Lightning Address", "Les adresses Lightning"]
parent_ids: []
related_ids: ["lnurl", "lightning-invoice"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB pro101 — Bitcoin Development Fundamentals"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Lightning Addresses

## Questions covered

- Does a Lightning Address work like a Bitcoin address?

## Short answer

A Lightning Address is a payment identifier that looks like an email address. It lets a compatible wallet ask the associated service for a Lightning invoice.

## Explanation

Instead of passing along a long invoice every time, the recipient shares a readable identifier. The infrastructure generally relies on LNURL-pay. The wallet contacts the service tied to the domain, obtains the payment information, then uses a Lightning invoice to pay.

The address can be reused, but the payment requests obtained are distinct. The simplicity comes from this automatic resolution. It does not replace channels or the liquidity constraints of the Lightning Network.

## Limits and confusions

A Lightning Address is neither an on-chain Bitcoin address nor necessarily an email inbox. Sending BTC on-chain to this identifier makes no sense without a conversion mechanism provided by a service.

The domain and the server become availability dependencies and can observe certain metadata. The format does not reveal the custody model of the wallet behind the address. Before paying, verify the identity of the recipient and the information presented by the wallet; a readable name can be misleading too.

## Further reading

- [[lnurl.en|LNURL links]] — understanding the exchange with the service
- [[lightning-invoice.en|Lightning invoices]] — distinguishing the identifier from the payment request

## References

- PlanB pro101 — Bitcoin Development Fundamentals (reference from the source note, not re-consulted directly for this adaptation).
