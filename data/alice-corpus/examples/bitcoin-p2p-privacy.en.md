---
type: "project_note"
id: "bitcoin-p2p-privacy"
title: "Privacy on the network"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Bitcoin P2P Privacy", "La confidentialité sur le réseau"]
parent_ids: []
related_ids: ["tor-browser", "wallet-node-connection", "non-blockchain-privacy-leaks", "secondary-privacy-vpn"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/bitcoin/bips/blob/master/bip-0324.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0156.mediawiki"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Privacy on the network

## Questions covered

- Can my IP address be associated with a transaction?

## Short answer

Bitcoin privacy also depends on network connections. An observer can gather clues about the IP address and the moment a transaction is broadcast, even though the chain contains no name.

## Explanation

The protections do not all address the same problem. Tor hides the originating address from certain counterparts. P2P transport v2 encrypts exchanges between peers, but does not hide their IP addresses nor all size and timing information.

Proposals such as Dandelion concern the initial propagation. Their presence in a specification document does not mean the software in use applies them. A principle, a proposal and a feature actually available must be distinguished.

## Limits and confusions

None of these tools erases links already published in transactions or sent to a platform. The 1st observation of a transaction gives a clue, not automatically proof of its author. The properties must be related to the configuration, the peers and the adversary considered, without any general promise of anonymity.

## Further reading

- [[tor-browser.en|The role and limits of Tor]].
- [[wallet-node-connection.en|Connecting a wallet to your node]].
- [[non-blockchain-privacy-leaks.en|Leaks outside the blockchain]].

- [[secondary-privacy-vpn.en|What a VPN protects]].

## References

- [Public reference kept from the source note](https://github.com/bitcoin/bips/blob/master/bip-0324.mediawiki).
- [Public reference kept from the source note](https://github.com/bitcoin/bips/blob/master/bip-0156.mediawiki).
