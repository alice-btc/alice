---
type: "project_note"
id: "alice-local-encryption"
title: "Local data in Alice App"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Alice App and learning"]
aliases: ["docs/security/local-chat-encryption.md", "Les données locales d’Alice App"]
parent_ids: []
related_ids: ["encryption", "alice-user-memory", "secondary-bitcoin-authenticated-encryption"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["alice-repo:46e2e9da:docs/security/local-chat-encryption.md", "https://www.w3.org/TR/webcrypto/#security-considerations"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Local data in Alice App

## Questions covered

- What does the application's local encryption protect?

## Short answer

Alice encrypts the supported local data when its encryption mechanism is available. This protection at rest does not guarantee the security of all data, nor that of a session that is already open.

## Explanation

The documentation at commit 46e2e9da distinguishes the browser from the desktop. In the browser, a non-extractable WebCrypto key is kept via IndexedDB. On desktop, the mechanism uses the system keychain. Conversations and several pieces of data managed by Explorer and the Playground go through the storage intended for this purpose.

Some preferences and the cache of public data are not within this scope. When the encryption mechanism is not available, the storages concerned may keep their plaintext behaviour. The platform and the environment therefore need to be specified.

## Limits and confusions

"Non-extractable" means that the WebCrypto API does not allow the key to be exported. This does not demonstrate protection against a full copy of the browser profile. No test of that kind is claimed here. A script from the same origin can still use the key.

Encryption does not protect against a person using the application in an unlocked session, nor against any software with access to that session. The general statement "all data is protected" should be avoided.

## Further reading

- [[encryption.en|Encryption and signatures]] — distinguish encryption from overall security
- [[alice-user-memory.en|Alice's personal memory]] — identify what is remembered

- [[secondary-bitcoin-authenticated-encryption.en|Authenticated encryption]].

## References

- [Local encryption, documentation corrected in F23 at commit 46e2e9da](alice-repo:46e2e9da:docs/security/local-chat-encryption.md).
- [W3C Web Cryptography, security](https://www.w3.org/TR/webcrypto/#security-considerations).
