---
type: "project_note"
id: "alice-private-cloud"
title: "Understanding Private Cloud mode"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Alice App and learning"]
aliases: ["docs/security/private-cloud-e2ee.md", "Comprendre le mode Private Cloud"]
parent_ids: []
related_ids: ["alice-user-memory", "alice-offline-limits"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["alice-repo:46e2e9da:docs/security/private-cloud-e2ee.md"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Understanding Private Cloud mode

## Questions covered

- Which protections and which limits need to be understood?

## Short answer

Private Cloud mode encrypts the request on the device and has its content processed in a remote hardware enclave. It should not be confused with local mode, where the model runs on the device.

## Explanation

The documented path protects the content in transit through the relays, then decrypts it inside the enclave so that the model can answer. The answer comes back encrypted. Intermediaries can still observe metadata, such as the requested model, the sizes and the timing of requests.

The documentation reviewed at commit 46e2e9da describes a verification of the hardware attestation and of its binding to the key before each send. It states, however, that the references that would allow verifying the exact software being executed are not yet enabled. The level reached is called attested-unpinned.

## Limits and confusions

It would be excessive to claim that Alice fully verifies all the code executed in the cloud. GPU attestation also remains a documented limit. Encryption and software verification are distinct guarantees.

The context needed for the answer, including some memory elements, may accompany the encrypted message. This note describes the scope documented at a specific version; it reports neither a new security audit nor a test of the service in production.

## Further reading

- [[alice-user-memory.en|Alice's personal memory]] — understand the context that may be transmitted
- [[alice-offline-limits.en|The limits of offline mode]] — distinguish cloud from local operation

## References

- [Private Cloud, guarantees and limits at commit 46e2e9da](alice-repo:46e2e9da:docs/security/private-cloud-e2ee.md).
