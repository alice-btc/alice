---
type: "project_note"
id: "secondary-bitcoin-hardened-derivation"
title: "La dérivation renforcée des clés"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Hardened Derivation"]
parent_ids: ["derivation-path", "extended-public-key"]
related_ids: ["derivation-path", "extended-public-key"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# La dérivation renforcée des clés

## Questions couvertes

- Que signifie hardened dans un chemin de dérivation ?

## Réponse courte

La dérivation hardened nécessite la clé privée parent et empêche de dériver cette branche depuis le seul xpub parent.

## Explication

- Elle est notée avec une apostrophe ou un h dans les chemins.
- Elle protège mieux certaines frontières hiérarchiques.
- Elle empêche un xpub parent de dériver cette branche.
- Elle est généralement utilisée aux niveaux élevés comme purpose, coin type et account.

## Limites et confusions

Elle ne protège pas contre la fuite de la clé privée de la branche ni contre une sauvegarde compromise.

## Approfondissements

- [[derivation-path.fr|Le chemin de dérivation]] pour revenir à la notion de base.
- [[extended-public-key.fr|La clé publique étendue]] pour revenir à la notion de base.

## Références

- PlanB cyp201 — Bitcoin Wallet Architecture
