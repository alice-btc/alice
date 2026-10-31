---
type: "project_note"
id: "lnurl"
title: "LNURL links"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["LNURL", "Les liens LNURL"]
parent_ids: []
related_ids: ["lightning-address", "lightning-invoice", "secondary-bitcoin-lnurl-auth", "secondary-bitcoin-wallet-as-identity"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB lnp201 — Lightning Network Theory"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# LNURL links

## Questions covered

- What is LNURL for?

## Short answer

LNURL groups together protocols that make certain Lightning interactions easier from a link or a QR code. Depending on the type of request, it can be used to pay, withdraw sats or authenticate.

## Explanation

LNURL-pay lets a wallet request an invoice from a reusable destination. LNURL-withdraw lets one present one's own invoice to a service offering a withdrawal. LNURL-auth is used for key-based authentication. These uses are distinct even though they all come in an easy-to-scan form.

The communication with a web service provides the automation a manually copied invoice would lack. It adds to the Lightning Network rather than replacing its payment mechanism.

## Limits and confusions

An LNURL QR code is not automatically a payment request. The wallet must state the requested action before the user authorizes it. Scanning a withdrawal code should not be read as paying its issuer.

Server availability and the privacy of the interaction matter. LNURL proves neither the solvency of the service nor the custody model of the funds. Support for each variant also depends on the wallet used.

## Further reading

- [[lightning-address.en|Lightning Addresses]] — seeing a use of LNURL-pay
- [[lightning-invoice.en|Lightning invoices]] — understanding the invoice used for settlement

- [[secondary-bitcoin-lnurl-auth.en|Authenticating with LNURL-AUTH]].
- [[secondary-bitcoin-wallet-as-identity.en|The wallet as a means of authentication]].

## References

- PlanB lnp201 — Lightning Network Theory (reference from the source note, not re-consulted directly for this adaptation).
