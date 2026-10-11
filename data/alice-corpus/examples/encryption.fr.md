---
type: "project_note"
id: "encryption"
title: "Chiffrement et signature"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Cryptographie et limites du protocole"]
aliases: ["Encryption"]
parent_ids: []
related_ids: ["digital-signature", "alice-local-encryption", "secondary-bitcoin-authenticated-encryption", "secondary-bitcoin-kerckhoffs-principle", "secondary-bitcoin-message-authenticity", "secondary-privacy-file-encryption", "secondary-privacy-full-disk-encryption"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB cyp302 — Modern Cryptography Fundamentals"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Chiffrement et signature

## Questions couvertes

- Quelle différence entre cacher un message et le signer ?

## Réponse courte

Le chiffrement protège la confidentialité d’un contenu en le transformant avec une clé. La signature sert à vérifier une autorisation ou une authenticité ; ces fonctions ne sont pas interchangeables.

## Explication

Un contenu chiffré doit être déchiffré avec les éléments appropriés pour redevenir lisible. Selon le système, une même clé secrète ou une paire de clés peut intervenir. Une signature, elle, peut être vérifiée publiquement sans que cela révèle la clé privée qui l’a produite.

Bitcoin utilise des signatures pour autoriser des dépenses. Cela ne rend pas les transactions publiques secrètes. Une application peut aussi chiffrer localement ses données ou protéger les messages échangés avec un service ; il faut préciser quel contenu et quel trajet sont concernés.

## Limites et confusions

« Chiffré » ne veut pas dire « protégé contre tout ». La gestion des clés, l’intégrité des messages, l’état de l’appareil et les données encore visibles déterminent la protection réelle. Un système doit généralement combiner confidentialité et mécanismes d’authentification appropriés.

Une personne qui contrôle la session déverrouillée ou le logiciel peut accéder à des données pendant leur utilisation. De même, chiffrer un stockage ne démontre pas à lui seul sa résistance à une copie complète du profil ou à une compromission de l’appareil.

## Approfondissements

- [[digital-signature.fr|La signature numérique]] — comprendre l’autorisation vérifiable
- [[alice-local-encryption.fr|Les données locales d’Alice App]] — voir un périmètre de protection concret

- [[secondary-bitcoin-authenticated-encryption.fr|Le chiffrement authentifié]].
- [[secondary-bitcoin-kerckhoffs-principle.fr|Le principe de Kerckhoffs]].
- [[secondary-bitcoin-message-authenticity.fr|L’authenticité d’un message]].
- [[secondary-privacy-file-encryption.fr|Chiffrer des fichiers sensibles]].
- [[secondary-privacy-full-disk-encryption.fr|Ce que protège le chiffrement du disque]].

## Références

- PlanB cyp302 — Modern Cryptography Fundamentals (référence de la note source, non reconsultée directement pour cette adaptation).
