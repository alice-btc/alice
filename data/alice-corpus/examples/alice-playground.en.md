---
type: "project_note"
id: "alice-playground"
title: "The Alice App playground wallet"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["alice-app", "learning"]
aliases: ["playground", "wallet de test", "Le wallet playground d’Alice App"]
parent_ids: []
related_ids: ["playground-testnet-limits", "alice-app-overview", "alice-offline-limits"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["alice-repo:apps/app-web/src/lib/playground.ts", "alice-repo:packages/practice-wallet/src/practice-keys.ts", "https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki", "https://github.com/MutinyWallet/mutiny-net"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The Alice App playground wallet

## Questions covered

- What is the Alice App playground wallet for?
- Am I using real bitcoins in it?

## Short answer

The playground wallet is the practice space of Alice App. It is used to experiment with on-chain operations using test sats on Mutinynet.

## Explanation

You can use it to discover the preparation, signing and broadcasting of an on-chain payment, then view the balance, the UTXOs and the history on the test network.

The playground creates its own 12-word BIP39 recovery phrase on the spot. The current flow does not offer importing an existing phrase. Backing up these words is part of the exercise; they control this practice wallet. Test sats are not mainnet bitcoins.

## Limits and confusions

Never enter the phrase of a wallet holding real funds into a test tool, a website or a conversation. The playground does not, on its own, demonstrate the behaviour of fees or delays on the main network.

## Further reading

- [[playground-testnet-limits.en|What the playground lets you test]] (playground-testnet-limits) to understand what a test experiment allows you to conclude.
- [[alice-app-overview.en|Finding your way around Alice App]].
- [[alice-offline-limits.en|The limits of offline mode]].

## References

- Product reference `alice-repo:apps/app-web/src/lib/playground.ts`. See the private provenance registry.
- Product reference `alice-repo:packages/practice-wallet/src/practice-keys.ts`. See the private provenance registry.

- [BIP39, recovery phrases](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki).

- [Mutinynet, test network and infrastructure](https://github.com/MutinyWallet/mutiny-net).
