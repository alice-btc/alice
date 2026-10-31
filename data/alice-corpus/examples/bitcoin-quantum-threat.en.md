---
type: "project_note"
id: "bitcoin-quantum-threat"
title: "Understanding the quantum risk"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["bitcoin", "security"]
aliases: ["risque quantique Bitcoin", "ordinateur quantique", "Comprendre le risque quantique"]
parent_ids: []
related_ids: ["bitcoin-quantum-threat-details"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://arxiv.org/abs/2603.28846v2", "https://github.com/bitcoin/bips/blob/master/bip-0360.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0361.mediawiki"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Understanding the quantum risk

## Questions covered

- What could a quantum computer change for Bitcoin?
- What is the link between a quantum computer, a public key and a signature?
- Does a study announce that Bitcoin has already been broken?
- Does Bitcoin already have complete protection against this risk?

## Short answer

A sufficiently powerful quantum computer could recover certain private keys from public keys and allow unauthorized spends. This is a cryptographic risk under study, not the demonstration of an attack already carried out against Bitcoin. Resource estimates and protection proposals do not make it possible to set a certain date.

## Explanation

A signature lets a node verify that a spend was authorized with the necessary keys. The security of the signatures used by Bitcoin relies in particular on a mathematical problem that is hard to solve with classical computers. A suitable quantum computer could change that difficulty.

The exposure of the public key matters. A key that is already visible gives an attacker more time; a key revealed during a spend creates a shorter window. The different output types and usage practices therefore do not all present the same exposure.

Researchers assess the resources needed for an attack, while developers discuss possible changes to Bitcoin. A migration would require protocol decisions, adoption by participants and adaptations of wallets. A published proposal does not mean those steps have been completed.

## Limits and confusions

- An estimate under assumptions does not describe a machine that has already been built.
- The announced number of qubits is not enough to compare machines. Their quality, error correction and operation speed matter.
- The risk to signatures must not be confused with an automatic disappearance of all of Bitcoin's protections.
- No certain timeline for an attack, nor any complete protection already achieved, is presented here.

## Further reading

- [[bitcoin-quantum-threat-details.en|Estimates and proposals facing the quantum risk]] (bitcoin-quantum-threat-details) for the dated figures, the assumptions and the limits of BIP 360 and 361.

## References

- [arXiv study 2603.28846, version 2 of 15 April 2026](https://arxiv.org/abs/2603.28846v2).
- [BIP 360, P2MR proposal](https://github.com/bitcoin/bips/blob/master/bip-0360.mediawiki).
- [BIP 361, migration proposal](https://github.com/bitcoin/bips/blob/master/bip-0361.mediawiki).
