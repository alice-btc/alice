---
type: "project_note"
id: "ark-security-model"
title: "Ark's security assumptions"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Ark and other layers"]
aliases: ["Ark Security Model", "Les hypothèses de sécurité d’Ark"]
parent_ids: []
related_ids: ["ark-implementations-bark-arkade", "ark-boarding-offboarding-and-exits"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://second.tech/docs/learn/lifetime", "https://second.tech/docs/learn/exit"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Ark's security assumptions

## Questions covered

- Who do you depend on when using Ark?

## Short answer

Ark combines a normal cooperative path with exit mechanisms to Bitcoin. The ability to exit alone depends on the VTXO, its expiry, the available data and the implementation.

## Explanation

Holding the keys is necessary, but does not sum up all of the security. You also have to keep the recovery transactions and be able to pay for their broadcast. With Second, an exit must be fully confirmed before the VTXO expires. Starting the procedure just before the expiry is therefore not enough.

After expiration, the user can no longer recover the funds alone and depends on the operator's cooperation. A loss becomes possible if that cooperation is missing. The wallet must renew VTXOs in time. Arkoor payments temporarily add a non-collusion assumption that must be distinguished from this expiration risk.

## Limits and confusions

A mass exit can make fees high, especially for small amounts or long paths. The exit that is theoretically available is not necessarily economical under all conditions.

The mechanisms of Second/Bark and of Arkade are not identical. The hardware or signing arrangements of one implementation must not be presented as guarantees common to all of Ark.

## Further reading

- [[ark-implementations-bark-arkade.en|Ark, Bark and Arkade, understanding the differences]] — Bark and Arkade — compare the assumptions
- [[ark-boarding-offboarding-and-exits.en|Entering and leaving Ark]] — understand the different exits

## References

- [Second, VTXO lifetime](https://second.tech/docs/learn/lifetime).
- [Second, emergency exits and confirmation conditions](https://second.tech/docs/learn/exit).
