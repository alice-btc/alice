---
type: "project_note"
id: "alice-local-encryption"
title: "Les données locales d’Alice App"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Alice App et apprentissage"]
aliases: ["docs/security/local-chat-encryption.md"]
parent_ids: []
related_ids: ["encryption", "alice-user-memory", "secondary-bitcoin-authenticated-encryption"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["alice-repo:46e2e9da:docs/security/local-chat-encryption.md", "https://www.w3.org/TR/webcrypto/#security-considerations"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les données locales d’Alice App

## Questions couvertes

- Que protège le chiffrement local de l’application ?

## Réponse courte

Alice chiffre les données locales prises en charge lorsque son mécanisme de chiffrement est disponible. Cette protection au repos ne garantit pas la sécurité de toutes les données ni celle d’une session déjà ouverte.

## Explication

La documentation au commit 46e2e9da distingue le navigateur et le desktop. Dans le navigateur, une clé WebCrypto non exportable est conservée via IndexedDB. Sur desktop, le mécanisme utilise le trousseau du système. Les discussions et plusieurs données gérées par Explorer et le Playground passent par le stockage prévu à cet effet.

Certaines préférences et le cache de données publiques ne sont pas dans ce périmètre. Lorsque le mécanisme de chiffrement n’est pas disponible, les stockages concernés peuvent conserver leur comportement en clair. La plateforme et l’environnement doivent donc être précisés.

## Limites et confusions

« Non exportable » signifie que l’API WebCrypto n’autorise pas l’export de la clé. Cela ne démontre pas une protection contre la copie complète du profil navigateur. Aucun essai de ce type n’est revendiqué ici. Un script de la même origine peut encore utiliser la clé.

Le chiffrement ne protège pas contre une personne utilisant l’application dans une session déverrouillée ni contre tout logiciel ayant accès à cette session. Il faut éviter la formule générale « toutes les données sont protégées ».

## Approfondissements

- [[encryption.fr|Chiffrement et signature]] — distinguer chiffrement et sécurité globale
- [[alice-user-memory.fr|La mémoire personnelle d’Alice]] — identifier ce qui est mémorisé

- [[secondary-bitcoin-authenticated-encryption.fr|Le chiffrement authentifié]].

## Références

- [Chiffrement local, documentation corrigée F23 au commit 46e2e9da](alice-repo:46e2e9da:docs/security/local-chat-encryption.md).
- [W3C Web Cryptography, sécurité](https://www.w3.org/TR/webcrypto/#security-considerations).
