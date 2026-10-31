---
type: "project_note"
id: "bitcoin-decentralization"
title: "Decentralization"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["fundamentals"]
aliases: ["Bitcoin Decentralization", "La décentralisation"]
parent_ids: []
related_ids: ["bitcoin-censorship-resistance", "bitcoin-node", "bitcoin-mining", "secondary-bitcoin-dns-seeds"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://developer.bitcoin.org/devguide/mining.html", "https://bitcoin.org/bitcoin.pdf"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Decentralization

## Questions covered

- What does decentralized mean for Bitcoin?

## Short answer

Decentralization spreads functions and powers among independent participants. In particular, it lets users verify the rules and makes it harder for a single actor to durably block payments.

## Explanation

Nodes verify blocks according to their own rules. Miners choose the transactions they want to include and produce blocks. Developers propose software; their proposals are not automatically imposed on users.

These functions must not be confused. A miner can leave a transaction out of its block. Other miners can include it afterwards. Conversely, producing a block does not give the power to have monetary creation that violates the nodes' rules accepted.

## Limits and confusions

Decentralized means neither the absence of concentrations nor perfect equality between participants. Pools, dominant software and intermediaries can introduce dependencies. The number of nodes alone does not measure all of decentralization. It is a property to be preserved through technical choices and practices, not an automatic guarantee against all censorship.

## Further reading

- [[bitcoin-censorship-resistance.en|Censorship resistance]].
- [[bitcoin-node.en|The role of a Bitcoin node]].
- [[bitcoin-mining.en|Understanding mining]].

- [[secondary-bitcoin-dns-seeds.en|Peer discovery through DNS]].

## References

- [Public reference kept from the source note](https://developer.bitcoin.org/devguide/mining.html).
- [Public reference kept from the source note](https://bitcoin.org/bitcoin.pdf).
