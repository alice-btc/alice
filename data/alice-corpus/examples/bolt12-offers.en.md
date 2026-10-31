---
type: "project_note"
id: "bolt12-offers"
title: "BOLT12 offers"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["BOLT12 Offers", "Les offres BOLT12"]
parent_ids: []
related_ids: ["lightning-invoice", "lightning-privacy-tradeoff", "secondary-bitcoin-onion-messaging", "secondary-lightning-blinded-paths"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/lightning/bolts/blob/master/12-offer-encoding.md"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# BOLT12 offers

## Questions covered

- What does a reusable offer change?

## Short answer

A BOLT12 offer is reusable payment information from which a compatible wallet can request a new Lightning invoice. The offer and the invoice are not the same object.

## Explanation

The payer starts from the offer, sends an invoice request, receives an invoice specific to the operation, then pays it. This exchange can go through Lightning's onion messages rather than through a dedicated HTTP server.

Blinded path mechanisms can limit certain information revealed about the recipient. The goal is to make receiving more practical while improving certain aspects of privacy. The same code displayed by a merchant can thus serve several requests, without turning an individual invoice into an eternally reusable one.

## Limits and confusions

The presence of the format in the specification does not mean that all wallets can create or pay an offer. For concrete use, check the software's features and version.

A privacy improvement is not a guarantee of anonymity. Routing, the service used and the information exchanged with the merchant can still reveal data. An offer also does not guarantee that a route with enough liquidity will be available at the time of payment.

## Further reading

- [[lightning-invoice.en|Lightning invoices]] — compare with a classic invoice
- [[lightning-privacy-tradeoff.en|Privacy on Lightning]] — examine the information exposed

- [[secondary-bitcoin-onion-messaging.en|Lightning onion messages]].
- [[secondary-lightning-blinded-paths.en|Blinded paths on Lightning]].

## References

- [BOLT 12 specification](https://github.com/lightning/bolts/blob/master/12-offer-encoding.md).
