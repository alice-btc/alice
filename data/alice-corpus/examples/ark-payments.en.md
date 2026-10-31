---
type: "project_note"
id: "ark-payments"
title: "Payments with Ark"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Ark and other layers"]
aliases: ["Ark Payments", "Les paiements avec Ark"]
parent_ids: []
related_ids: ["ark-implementations-bark-arkade", "ark-security-model"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://second.tech/docs/learn/payments"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Payments with Ark

## Questions covered

- How does an Ark payment compare with an on-chain payment?

## Short answer

Ark allows off-chain payments without requiring each user to manage Lightning channels. With Second/Bark, arkoor payments quickly create new VTXOs from an existing structure.

## Explanation

The payment can leave a part as change to the sender and assign a new claim to the recipient. Depending on the wallet, the recipient may receive without being online at the same time. The server cooperates in normal operation.

A VTXO received through arkoor carries a non-collusion assumption between the previous senders and the server. Renewal in a round makes it possible to return to the standard model described by the implementation. This trade-off explains why a fast payment and a unilateral exit should not be confused with a guarantee free of any assumption.

## Limits and confusions

An operator's reputation and its expected revenue may discourage cheating. They are not a cryptographic guarantee against collusion.

The absence of channel management on the user's side does not make all costs zero. Renewals, exits and some connections to Lightning use liquidity and fees. The wallet's policies and the VTXOs' expiry dates must remain visible.

## Further reading

- [[ark-implementations-bark-arkade.en|Ark, Bark and Arkade, understanding the differences]] — Bark and Arkade — see the scope of the mechanisms
- [[ark-security-model.en|Ark's security assumptions]] — examine the assumptions and recourses

## References

- [Technical reference 1](https://second.tech/docs/learn/payments).
