---
type: "project_note"
id: "fedimint-custody-and-privacy"
title: "Fedimint, federated custody and privacy"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin-layers", "custody", "privacy"]
aliases: ["Fedimint", "gardiens", "ecash fédéré", "Fedimint, garde fédérée et confidentialité"]
parent_ids: ["cashu-et-confiance-dans-le-mint", "bitcoin-layered-architecture", "self-custody"]
related_ids: ["spark-trust-and-exits", "ark-implementations-bark-arkade"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://offchain.media/article/what-ecash-david-chaums-confidential-transaction-protocol-bitcoin/", "https://fedimint.org/docs/TradeOffs/Trust-Trade-Offs/", "https://fedimint.org/guardians/intro", "https://fedimint.org/users/intro"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Fedimint, federated custody and privacy

## Questions covered

- Who holds the bitcoin in Fedimint?
- What do blind signatures protect?
- Does a federation replace self-custody of keys?

## Short answer

Fedimint organizes collective custody of BTC by guardians. The user holds ecash units that can be redeemed with the federation. The privacy of transfers can be improved while a dependency on these guardians remains.

## Explanation

The guardians hold the keys that manage the bitcoin reserve according to the configured threshold. The user receives digital units whose validation relies on blind signatures. This mechanism limits the link the federation can establish between their issuance and their use.

With these units alone, the user does not have the keys that would allow them to spend a share of the Bitcoin reserve directly. The federation must keep operating and honor redemptions. Sufficient collusion, unavailability or unbacked issuance can compromise the funds.

The model therefore rests on cryptographic guarantees and on explicit trust in a community of guardians. Reputation can encourage good behavior; it does not guarantee the absence of collusion.

## Limits and confusions

Privacy of the units, network metadata and data observed by Lightning gateways are distinct topics. Blind signatures do not make all activity invisible.

Handing over a unit offline does not by itself prove that it has not already been spent. Do not promise complete offline validation for every Fedimint application.

The Offchain Media summary was cross-checked against the Fedimint documents consulted on 2026-10-11. No audit of any specific reserve, federation or wallet was carried out.

## Further reading

- [[spark-trust-and-exits.en|Spark, operators and exits to Bitcoin]] — comparing federated custody with a model based on user keys and operators.
- [[ark-implementations-bark-arkade.en|Ark, Bark and Arkade, understanding the differences]] — examining the exit conditions of VTXOs.

## References

- [Marius, Offchain Media, ecash, Cashu and Fedimint, 8 May 2026](https://offchain.media/article/what-ecash-david-chaums-confidential-transaction-protocol-bitcoin/).
- [Fedimint, privacy and trust](https://fedimint.org/docs/TradeOffs/Trust-Trade-Offs/).
- [Fedimint, role of the guardians](https://fedimint.org/guardians/intro).
- [Fedimint, introduction for users](https://fedimint.org/users/intro).
