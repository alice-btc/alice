---
type: "project_note"
id: "bitcoin-public-key"
title: "La clé publique"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["Bitcoin Public Key"]
parent_ids: []
related_ids: ["bitcoin-private-key", "extended-public-key", "bitcoin-quantum-threat", "secondary-bitcoin-elliptic-curve-cryptography", "secondary-bitcoin-secp256k1"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La clé publique

## Questions couvertes

- Que peut faire quelqu’un avec ma clé publique ?

## Réponse courte

Une clé publique permet de vérifier des signatures produites avec une clé privée correspondante. La connaître ne donne normalement pas le pouvoir de créer ces signatures ni de dépenser les fonds.

## Explication

La clé publique est calculée à partir de la clé privée par les opérations cryptographiques de Bitcoin. Les adresses peuvent être dérivées d’une clé publique ou représenter des conditions plus complexes. Clé publique et adresse ne sont donc pas des termes interchangeables.

Les vérificateurs utilisent les données publiques pour contrôler les autorisations de dépense. Cette séparation permet au secret de rester dans le portefeuille ou l’appareil de signature.

## Limites et confusions

Public ne signifie pas sans conséquence pour la confidentialité. Des informations publiques peuvent aider à rapprocher des transactions. Une clé publique étendue donne accès à davantage d’informations qu’une clé isolée et mérite une attention particulière. Cette explication repose sur la sécurité des primitives employées ; le risque quantique éventuel se traite séparément, sans affirmer qu’une attaque pratique est disponible.

## Approfondissements

- [[bitcoin-private-key.fr|La clé privée]].
- [[extended-public-key.fr|La clé publique étendue]].
- [[bitcoin-quantum-threat.fr|Comprendre le risque quantique]].

- [[secondary-bitcoin-elliptic-curve-cryptography.fr|La cryptographie sur courbes elliptiques]].
- [[secondary-bitcoin-secp256k1.fr|La courbe secp256k1]].

## Références

- PlanB cyp201 — Bitcoin Wallet Architecture.
- PlanB Extraction — 2026-05-23.
