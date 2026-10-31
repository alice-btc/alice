---
type: "project_note"
id: "cashu-et-confiance-dans-le-mint"
title: "Ecash and trust in a mint"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Ark and other layers"]
aliases: ["Cashu et confiance dans le mint", "L’ecash et la confiance dans un mint"]
parent_ids: []
related_ids: ["fedimint-custody-and-privacy", "custodial-lightning-wallet", "secondary-bitcoin-blind-signatures", "secondary-bitcoin-digicash"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://docs.cashu.space/faq"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Ecash and trust in a mint

## Questions covered

- Who do you have to trust when using a Cashu mint?

## Short answer

Cashu uses digital bearer tokens issued by a mint. The wallet keeps these tokens, while the mint holds the bitcoins that are supposed to allow their conversion into payments.

## Explanation

Blind signatures limit the linking of a token's issuance to its spending. This property aims at the privacy of ecash. It does not take custody of the underlying BTC away from the mint.

Each mint issues its own tokens. Moving from one to another requires a conversion, for example via Lightning. Receiving a token from a given mint therefore exposes you to how that mint operates, not to a claim universally interchangeable between all operators.

## Limits and confusions

Holding the files or tokens on your phone does not mean controlling the keys of the reserve bitcoins. The mint can be unavailable, insolvent or refuse the conversion.

Cryptographic privacy does not automatically hide all network metadata or all the information provided to the service. The advantage of blind signatures must be distinguished from the custody model. Alice must present ecash as a payment and privacy trade-off, without calling it Bitcoin self-custody on the sole basis that the tokens are held locally.

## Further reading

- [[fedimint-custody-and-privacy.en|Fedimint, federated custody and privacy]] — Fedimint — compare with a federated mint
- [[custodial-lightning-wallet.en|Custody on Lightning]] — understand custody of the underlying funds

- [[secondary-bitcoin-blind-signatures.en|Blind signatures]].
- [[secondary-bitcoin-digicash.en|DigiCash before Bitcoin]].

## References

- [Official Cashu FAQ](https://docs.cashu.space/faq).
