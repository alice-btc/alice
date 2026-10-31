---
type: "project_note"
id: "entropy"
title: "The randomness keys need"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Cryptography and protocol limits"]
aliases: ["Entropy", "L’aléa nécessaire aux clés"]
parent_ids: []
related_ids: ["digital-signature", "cryptographic-hash-function", "secondary-bitcoin-deterministic-ecdsa-nonce", "secondary-bitcoin-pseudorandom-number-generator", "secondary-bitcoin-random-number-generation"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki", "https://coldcard.com/docs/verifying-dice-roll-math/"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The randomness keys need

## Questions covered

- Why must keys not be predictable?

## Short answer

Entropy refers to the unpredictability needed to produce secrets that are hard to guess. A key or a phrase that is long but predictable can be much less secure than it looks.

## Explanation

A wallet must use a cryptographically suitable generator. That generator can combine software or hardware mechanisms; the presence of a chip does not by itself guarantee good randomness.

In BIP39, the phrase encodes 128 to 256 bits of entropy, in multiples of 32, with a checksum. This checksum helps detect some errors, but adds no unpredictable secret. Choosing words oneself that seem original is not a safe generation method.

## Limits and confusions

Lengthening a known phrase or a repetitive sequence does not automatically add more entropy. Security depends on how the secret was produced, not simply on how it looks.

Dice can take part in some documented procedures, provided there are enough independent and unbiased rolls and a correct conversion. The software's verified procedure must be followed, without improvising a number of rolls. Alice must never ask for the generated phrase in order to "check" its quality.

## Further reading

- [[digital-signature.en|Digital signatures]] — linking the secret to the authorization to spend
- [[cryptographic-hash-function.en|The cryptographic hash]] — distinguishing unpredictability from a hash

- [[secondary-bitcoin-deterministic-ecdsa-nonce.en|Deterministic ECDSA nonces]].
- [[secondary-bitcoin-pseudorandom-number-generator.en|Cryptographic pseudorandom number generators]].
- [[secondary-bitcoin-random-number-generation.en|Generating random secrets]].

## References

- [BIP39 — entropy, checksum and the distinction from invented phrases](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki).
- [Coldcard — verification and conditions of its dice-roll procedure](https://coldcard.com/docs/verifying-dice-roll-math/).
