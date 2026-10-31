---
type: "project_note"
id: "ark-vtxos"
title: "Ark's virtual outputs"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Ark and other layers"]
aliases: ["Ark VTXOs", "Les sorties virtuelles d’Ark"]
parent_ids: []
related_ids: ["ark-implementations-bark-arkade", "ark-security-model"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://second.tech/docs/learn/exit", "https://second.tech/docs/learn/lifetime", "https://docs.arkadeos.com/learn/core-concepts/vtxo-lifecycle-and-liveness"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Ark's virtual outputs

## Questions covered

- What is a VTXO?

## Short answer

A VTXO is a virtual output used in Ark. It represents a claim on bitcoins through pre-signed transactions, with payment and recovery conditions specific to its type.

## Explanation

Several users can share a structure of transactions anchored on Bitcoin, while having individual exit paths. As long as operation is cooperative, payments stay off-chain. An emergency exit broadcasts the transactions needed to return to Bitcoin UTXOs.

With Second/Bark, provenance distinguishes in particular VTXOs that come from an on-chain entry, from a renewal and from an arkoor payment. The latter add a temporary non-collusion assumption between the previous senders and the server. The name VTXO is therefore not enough to determine all the guarantees.

## Limits and confusions

A VTXO has an expiry. In the documented mechanisms, unilateral recovery must complete in time; with Second, it must be fully confirmed before expiration. The recovery data and the necessary fees must be available.

The VTXO must not be presented as an ordinary Bitcoin output that is already directly spendable. Its history, its anchoring and the implementation determine the recovery path.

## Further reading

- [[ark-implementations-bark-arkade.en|Ark, Bark and Arkade, understanding the differences]] — Bark and Arkade — clarify the differences
- [[ark-security-model.en|Ark's security assumptions]] — understand expiration and the risks

## References

- [Technical reference 1](https://second.tech/docs/learn/exit).
- [Technical reference 2](https://second.tech/docs/learn/lifetime).
- [Technical reference 3](https://docs.arkadeos.com/learn/core-concepts/vtxo-lifecycle-and-liveness).
