---
type: "project_note"
id: "ark-boarding-offboarding-and-exits"
title: "Entering and leaving Ark"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Ark and other layers"]
aliases: ["Ark Boarding Offboarding and Exits", "Entrer et sortir d’Ark"]
parent_ids: []
related_ids: ["ark-security-model", "ark-implementations-bark-arkade"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["Second, Ark boarding et Ark offboarding, documentation citée dans la note source", "Arkade, Ramps: Onboarding & Offboarding, documentation citée dans la note source"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Entering and leaving Ark

## Questions covered

- How to distinguish a cooperative exit from a unilateral exit?

## Short answer

Entering Ark, exiting with the operator and exiting without its cooperation are different operations. They do not have the same fees, the same delays or the same conditions.

## Explanation

Boarding brings on-chain bitcoins in to create a VTXO. The exact path depends on the implementation and the wallet; some interfaces also use swap services. Receiving an Ark payment does not necessarily require doing a boarding yourself.

Cooperative offboarding turns the off-chain claim into a Bitcoin payment with the help of the server. An emergency exit, by contrast, uses the pre-signed transactions and the planned timelocks to recover without that cooperation. It may require several successive broadcasts and careful fee management.

## Limits and confusions

An emergency exit is not a free, instant withdrawal. Its feasibility depends on the type of VTXO, the data kept and the expiry. With Second, it must be fully confirmed before expiration.

The wallet must distinguish a usual cooperative operation from an emergency recourse. Bark's procedures must not be applied blindly to Arkade or to another implementation. For a concrete operation, consult the guidance of the version in use.

## Further reading

- [[ark-security-model.en|Ark's security assumptions]] — identify the recovery conditions
- [[ark-implementations-bark-arkade.en|Ark, Bark and Arkade, understanding the differences]] — Bark and Arkade — understand the implementations

## References

- Second, Ark boarding and Ark offboarding, documentation cited in the source note (reference from the source note, not re-consulted directly for this adaptation).
- Arkade, Ramps: Onboarding & Offboarding, documentation cited in the source note (reference from the source note, not re-consulted directly for this adaptation).
