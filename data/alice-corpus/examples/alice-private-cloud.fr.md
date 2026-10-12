---
type: "project_note"
id: "alice-private-cloud"
title: "Comprendre le mode Private Cloud"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Alice App et apprentissage"]
aliases: ["docs/security/private-cloud-e2ee.md"]
parent_ids: []
related_ids: ["alice-user-memory", "alice-offline-limits"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["alice-repo:46e2e9da:docs/security/private-cloud-e2ee.md"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Comprendre le mode Private Cloud

## Questions couvertes

- Quelles protections et quelles limites faut-il comprendre ?

## Réponse courte

Le mode Private Cloud chiffre la requête sur l’appareil et fait traiter son contenu dans une enclave matérielle distante. Il ne faut pas le confondre avec le mode local, où le modèle fonctionne sur l’appareil.

## Explication

Le trajet documenté protège le contenu en transit à travers les relais, puis le déchiffre dans l’enclave pour que le modèle puisse répondre. La réponse revient chiffrée. Les intermédiaires peuvent encore observer des métadonnées, comme le modèle demandé, les tailles et les horaires de requête.

La documentation relue au commit 46e2e9da décrit une vérification de l’attestation matérielle et de la liaison avec la clé avant chaque envoi. Elle précise toutefois que les références permettant de vérifier le logiciel exact exécuté ne sont pas encore activées. Le niveau atteint est nommé attested-unpinned.

## Limites et confusions

Il serait excessif d’affirmer qu’Alice vérifie intégralement tout le code exécuté dans le cloud. L’attestation GPU reste également une limite documentée. Le chiffrement et la vérification du logiciel sont des garanties distinctes.

Le contexte nécessaire à la réponse, y compris certains éléments de mémoire, peut accompagner le message chiffré. Cette fiche décrit le périmètre documenté à une version précise ; elle ne rapporte ni un nouvel audit de sécurité ni un test du service en production.

## Approfondissements

- [[alice-user-memory.fr|La mémoire personnelle d’Alice]] — comprendre le contexte susceptible d’être transmis
- [[alice-offline-limits.fr|Les limites du mode hors ligne]] — distinguer cloud et fonctionnement local

## Références

- [Private Cloud, garanties et limites au commit 46e2e9da](alice-repo:46e2e9da:docs/security/private-cloud-e2ee.md).
