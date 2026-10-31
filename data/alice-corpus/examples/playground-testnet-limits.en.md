---
type: "project_note"
id: "playground-testnet-limits"
title: "What the playground lets you test"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["alice-app", "learning"]
aliases: ["Mutinynet", "réseau de test", "Ce que le playground permet de tester"]
parent_ids: ["alice-playground"]
related_ids: []
reviewed_at: "2026-10-11"
review_due: null
sources: ["alice-repo:apps/app-web/src/lib/playground.ts", "alice-repo:packages/practice-wallet/src/practice-keys.ts", "https://github.com/MutinyWallet/mutiny-net", "https://github.com/bitcoin/bips/blob/master/bip-0325.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki", "https://github.com/bitcoin/bitcoin/blob/master/src/kernel/chainparams.cpp"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# What the playground lets you test

## Questions covered

- If a payment works on Mutinynet, will it work the same way on mainnet?
- Is the address prefix enough to identify the network?

## Short answer

The playground makes it possible to practice a transaction flow on a test network. It does not guarantee the same fees, delays or conditions of use on mainnet.

## Explanation

Mutinynet is a custom signet, a test network where blocks must carry the signatures authorized by its configuration. Its documentation announces a pace of about 30 seconds per block, against about 10 minutes on average on Bitcoin mainnet. This does not guarantee a confirmation within 30 seconds. Its sats are meant for testing and have no monetary value.

For the usual formats, prefixes distinguish mainnet (`bc1`, `1`, `3`) from test networks (`tb1`, `m`, `n`, `2`). However, several test networks share their prefixes. A `tb1` address is therefore not enough to identify Mutinynet; the chosen network and the service being queried must be checked.

The playground depends on third-party infrastructure to look up and broadcast transactions. An outage of these services can interrupt the exercise, without meaning that Bitcoin mainnet is down.

## Limits and confusions

A result observed on Mutinynet remains a test result. Fees, block pace, validation conditions and service availability can differ from mainnet. Succeeding with a payment here is not enough to predict its conditions on the main network.

## Further reading

- [[alice-playground.en|The Alice App playground wallet]] (alice-playground) — going back to the scope of the practice space.

## References

- Product reference `alice-repo:apps/app-web/src/lib/playground.ts`. See the private provenance registry.
- Product reference `alice-repo:packages/practice-wallet/src/practice-keys.ts`. See the private provenance registry.

- [Mutinynet, custom signet and announced 30-second pace](https://github.com/MutinyWallet/mutiny-net).

- [BIP325, signet rules](https://github.com/bitcoin/bips/blob/master/bip-0325.mediawiki).

- [BIP173, Bech32 network prefixes](https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki).

- [Bitcoin Core, network parameters and prefixes](https://github.com/bitcoin/bitcoin/blob/master/src/kernel/chainparams.cpp).
