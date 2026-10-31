---
type: "project_note"
id: "bitcoin-quantum-threat-details"
title: "Estimates and proposals facing the quantum risk"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin", "security"]
aliases: ["BIP 360", "BIP 361", "P2MR", "signatures post-quantiques", "Estimations et propositions face au risque quantique"]
parent_ids: ["bitcoin-quantum-threat"]
related_ids: []
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://arxiv.org/abs/2603.28846v2", "https://github.com/bitcoin/bips/blob/master/bip-0360.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0361.mediawiki"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Estimates and proposals facing the quantum risk

## Questions covered

- What does the estimate of fewer than 500,000 physical qubits mean?
- What is the difference between physical and logical qubits?
- How to distinguish long exposure from short exposure of a public key?
- What do BIP 360 and 361 propose, and what do they not guarantee?
- Can a date be announced for a migration or a first attack?

## Short answer

The estimates depend on hardware and algorithmic assumptions. They do not prove that a machine capable of attacking Bitcoin has been built. BIP 360 and 361 are proposals with `Draft` status in the texts consulted on 2026-10-11; they constitute neither an activated complete protection nor an adopted timeline.

## Explanation

### A dated estimate, not a machine that has been built

The study by Ryan Babbush and co-authors, **arXiv 2603.28846v2, revised on 15 April 2026**, estimates that an attack on the 256-bit elliptic curve discrete logarithm problem could use **fewer than 500,000 physical qubits** with a superconducting architecture, planar connectivity and a physical error rate of **10⁻³**. This result models resources under assumptions; it does not report the construction of that machine nor an attack carried out. [Abstract and original version](https://arxiv.org/abs/2603.28846v2).

A physical qubit is a hardware component. A logical qubit is a unit made more reliable through error correction. The ratio between the 2 depends on the architecture and the errors. An isolated qubit count is therefore not enough to compare machines or to predict a deadline.

### Proposals with different scopes

| Text consulted on 2026-10-11 | Proposed scope | Limit to keep in mind |
|---|---|---|
| BIP 360, `Draft`, P2MR | Proposes an output committed to a script tree, without a key-path spend like Taproot's. Targets the long exposure of public keys. | Does not by itself introduce complete post-quantum signatures. A key revealed during a pending transaction can remain a target; protection against these short attacks requires more. [Original text](https://github.com/bitcoin/bips/blob/master/bip-0360.mediawiki). |
| BIP 361, `Draft`, type `Informational` | Proposes a migration followed by restrictions on the use of legacy signatures. | Depends on a future post-quantum signatures BIP still indicated as undefined. Its timeline is a proposal relative to a possible activation, not a deadline adopted by Bitcoin. [Original text](https://github.com/bitcoin/bips/blob/master/bip-0361.mediawiki). |

Long exposure gives the attacker time to exploit a public key that is already known. Short exposure concerns in particular its revelation while waiting for a confirmation. Hiding a key until the spend does not by itself solve the scenario of an attack fast enough during that wait.

A migration also raises questions about access to funds and the treatment of outputs that would not migrate. The proposed restrictions require examining their consequences; their protective intent does not amount to adoption nor to a guarantee of result.

## Limits and confusions

- No ranking of the most advanced machines based on a simple qubit count is inferred here.
- The dates of a study, a revision and a BIP are publication dates, not predicted attack dates.
- A numbered BIP or one with `Draft` status does not prove its activation in Bitcoin.
- The hardware assumptions, the estimates and the migration texts must be re-checked before an update. This note reports their documentary state, without independent experimental validation.

## Further reading

- [[bitcoin-quantum-threat.en|Understanding the quantum risk]] (bitcoin-quantum-threat) to return to the introduction.

## References

- [Babbush and co-authors, arXiv 2603.28846v2](https://arxiv.org/abs/2603.28846v2), version revised on 15 April 2026, for the estimate and its assumptions.
- [BIP 360, Pay-to-Merkle-Root](https://github.com/bitcoin/bips/blob/master/bip-0360.mediawiki), for its scope on long exposure and its limits on short exposure.
- [BIP 361, Post Quantum Migration and Legacy Signature Sunset](https://github.com/bitcoin/bips/blob/master/bip-0361.mediawiki), for the proposed migration, its status and its dependency on a signatures proposal yet to be defined.
