---
type: "project_note"
id: "secondary-privacy-public-wi-fi-risk"
title: "Les risques d’un réseau Wi-Fi non fiable"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Public Wi-Fi Risk"]
parent_ids: ["threat-model", "non-blockchain-privacy-leaks"]
related_ids: ["threat-model", "non-blockchain-privacy-leaks"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB scu101 — Update Your Online Security"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les risques d’un réseau Wi-Fi non fiable

## Questions couvertes

- Les risques d’un réseau Wi-Fi non fiable — quel mécanisme et quelles limites ?

## Réponse courte

Sur un réseau Wi-Fi non fiable, les faux points d’accès, portails captifs et services locaux exposés ajoutent des risques. Le risque dépend aussi du chiffrement des connexions et de la sécurité de l’appareil.

## Explication

- Contrôler le domaine et utiliser une connexion HTTPS valide.
- Éviter les installations de logiciels ou de certificats demandées par un portail douteux.
- Désactiver le partage local inutile et les connexions automatiques non souhaitées.
- Un VPN déplace une partie de la confiance vers son fournisseur ; il ne protège pas de toutes les attaques.

## Limites et confusions

Un réseau mobile n’est pas une garantie de sécurité. HTTPS protège le transport vers le bon domaine, mais pas contre un site frauduleux ou un appareil compromis.

## Approfondissements

- [[threat-model.fr|Adapter la protection aux risques]] pour replacer ce mécanisme dans son contexte.
- [[non-blockchain-privacy-leaks.fr|Les fuites hors de la blockchain]] pour replacer ce mécanisme dans son contexte.

## Références

- PlanB scu101 — Update Your Online Security
