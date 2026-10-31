---
type: "project_note"
id: "sidechains"
title: "Sidechains"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Ark and other layers"]
aliases: ["Sidechains", "Les chaînes latérales"]
parent_ids: []
related_ids: ["liquid-network", "bitcoin-layered-architecture", "secondary-bitcoin-merged-mining"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://docs.liquid.net/docs/technical-overview"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Sidechains

## Questions covered

- What is a sidechain?

## Short answer

A sidechain is a separate chain linked to Bitcoin by an anchoring or conversion mechanism. It has its own rules and does not automatically keep all of Bitcoin's guarantees.

## Explanation

For a BTC-backed asset, a peg mechanism generally organizes the locking of bitcoins and the representation of their quantity on the separate chain. The reverse path has to allow their return under the system's conditions. Security therefore depends both on the sidechain and on this passage.

A federation may take part in producing blocks or in controlling the funds. Other architectures propose different mechanisms. Added functions, such as assets or certain forms of privacy, have to be evaluated with these additional assumptions.

## Limits and confusions

A 1:1 backing objective guarantees neither a permanently equal price nor an immediate withdrawal. The reserves, the authorized actors and the possibilities of interruption have to be examined. Not every asset issued on a sidechain is backed by bitcoin.

The existence of a technical proposal or a BIP does not demonstrate its adoption by the network. A sidechain, a Lightning channel and a custodial service are not to be presented as equivalent.

## Further reading

- [[liquid-network.en|Understanding Liquid]] — study a federated sidechain
- [[bitcoin-layered-architecture.en|Bitcoin's layers]] — compare with other architectures

- [[secondary-bitcoin-merged-mining.en|Merged mining]].

## References

- [Liquid, technical overview](https://docs.liquid.net/docs/technical-overview).
