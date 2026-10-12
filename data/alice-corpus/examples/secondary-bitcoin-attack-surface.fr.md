---
type: "project_note"
id: "secondary-bitcoin-attack-surface"
title: "La surface d’attaque"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Attack Surface"]
parent_ids: ["hardware-wallet", "threat-model"]
related_ids: ["hardware-wallet", "threat-model"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["Synthèse du vault — Attack Surface ; référence externe non précisée dans la note source."]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# La surface d’attaque

## Questions couvertes

- Pourquoi limiter les interfaces et les logiciels exposés ?

## Réponse courte

La surface d'attaque regroupe les interfaces et chemins qu'un attaquant peut exploiter. Réduire les services et permissions inutiles peut limiter l'exposition.

## Explication

- Un ordinateur polyvalent expose de nombreux logiciels et services ; un dispositif de signature spécialisé réduit certaines de ces interfaces.
- La sécurité finale dépend néanmoins du matériel, du logiciel et des opérations réellement confirmées par l’utilisateur.

## Limites et confusions

Un hardware wallet réduit certains risques sans supprimer firmware, interfaces, chaîne d'approvisionnement et erreur humaine.

## Approfondissements

- [[hardware-wallet.fr|Le rôle d’un appareil de signature]] pour revenir à la notion de base.
- [[threat-model.fr|Adapter la protection aux risques]] pour revenir à la notion de base.

## Références

- Synthèse du vault — Attack Surface ; référence externe non précisée dans la note source.
